import { Streamlit, withStreamlitConnection } from "streamlit-component-lib"
import React, {
  useEffect,
  useMemo,
  useState,
  ReactElement,
  useCallback,
} from "react"
import { PeraWalletConnect } from "@perawallet/connect"
import algosdk from "algosdk"
import { AlgorandClient } from "@algorandfoundation/algokit-utils"

interface Args {
  network: "mainnet" | "testnet"
  transactionsToSign: string[]
  frameHeight: number
}

type WalletState =
  | { status: "connected"; address: string }
  | { status: "unavailable" | "disconnected"; address: null }

type TransactionState =
  | { status: "proposed" | "signed" | "submitted" }
  | { status: "confirmed"; txId: string }
  | { status: "failed"; msg: string }

/**
 * This is a React-based component template. The passed props are coming from the
 * Streamlit library. Your custom args can be accessed via the `args` props.
 */
function MyComponent({ args }: { args: Args }): ReactElement {
  const { network, transactionsToSign, frameHeight } = args

  const [transactions, setTransactions] = useState<string[]>(transactionsToSign)
  const [accountAddress, setAccountAddress] = useState<string | null>(null)
  const isConnectedToPeraWallet = !!accountAddress

  const walletState = useMemo<WalletState>(() => {
    const state: WalletState = accountAddress
      ? { status: "connected", address: accountAddress }
      : {
          status: !window.crypto?.subtle ? "unavailable" : "disconnected",
          address: null,
        }
    Streamlit.setComponentValue([state, null])
    return state
  }, [accountAddress])

  const { algorand, peraWallet } = useMemo(() => {
    switch (network) {
      case "mainnet":
        return {
          algorand: AlgorandClient.mainNet(),
          peraWallet: new PeraWalletConnect({
            chainId: 416001,
            shouldShowSignTxnToast: false,
          }),
        }
      case "testnet":
        return {
          algorand: AlgorandClient.testNet(),
          peraWallet: new PeraWalletConnect({
            chainId: 416002,
            shouldShowSignTxnToast: false,
          }),
        }
      default:
        throw new Error(
          `Unsupported network: '${network}'. Please use 'mainnet' or 'testnet'.`
        )
    }
  }, [network])

  const transactionSigners = useMemo(() => {
    return transactions.map((item: string) => {
      return {
        txn: algosdk.decodeUnsignedTransaction(Buffer.from(item, "base64")),
        signers: [accountAddress ?? ""],
      }
    })
  }, [accountAddress, transactions])

  const signTransactions = useCallback(async () => {
    Streamlit.setComponentValue([walletState, { status: "proposed" }])
    try {
      const signedTransactions = await peraWallet.signTransaction([
        transactionSigners,
      ])

      Streamlit.setComponentValue([walletState, { status: "submitted" }])
      const { txid } = await algorand.client.algod
        .sendRawTransaction(signedTransactions)
        .do()

      console.log(`Transaction ID: ${txid}`)
      setTransactions([])
      Streamlit.setComponentValue([
        walletState,
        { status: "confirmed", txId: txid },
      ])
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      console.log("Transaction failed:", msg)
      Streamlit.setComponentValue([walletState, { status: "failed", msg: msg }])
    }
  }, [network, transactionSigners])

  useEffect(() => {
    Streamlit.setFrameHeight()
    // Reconnect to the session when the component is mounted
    peraWallet
      .reconnectSession()
      .then((accounts) => {
        peraWallet.connector?.on("disconnect", handleDisconnectWalletClick)

        if (accounts.length) {
          setAccountAddress(accounts[0])
        }
      })
      .catch((e) => console.log(e))
  }, [])

  return (
    <>
      {window.crypto?.subtle && (
        <div style={{ display: "flex", gap: "10px" }}>
          {isConnectedToPeraWallet && transactions.length !== 0 && (
            <button
              onClick={signTransactions}
              style={{
                backgroundColor: "var(--primary-color)",
                color: "rgb(250, 250, 250)",
              }}
            >
              Sign Transaction
            </button>
          )}
          <button
            onClick={
              isConnectedToPeraWallet
                ? handleDisconnectWalletClick
                : handleConnectWalletClick
            }
          >
            {isConnectedToPeraWallet ? "Disconnect" : "Connect Pera Wallet"}
          </button>
        </div>
      )}
    </>
  )

  function handleConnectWalletClick() {
    Streamlit.setFrameHeight(frameHeight)
    peraWallet
      .connect()
      .then((newAccounts) => {
        peraWallet.connector?.on("disconnect", handleDisconnectWalletClick)

        setAccountAddress(newAccounts[0])
      })
      .catch((error) => {
        if (error?.data?.type !== "CONNECT_MODAL_CLOSED") {
          console.log(error)
        }
      })
      .finally(() => {
        Streamlit.setFrameHeight()
      })
  }

  function handleDisconnectWalletClick() {
    if (peraWallet.connector?.peerId) {
      peraWallet.disconnect()
    }
    setAccountAddress(null)
  }
}

// "withStreamlitConnection" is a wrapper function. It bootstraps the
// connection between your component and the Streamlit app, and handles
// passing arguments from Python -> Component.
//
// You don't need to edit withStreamlitConnection (but you're welcome to!).
export default withStreamlitConnection(MyComponent)
