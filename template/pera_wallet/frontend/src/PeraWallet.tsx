import {
  Streamlit,
  withStreamlitConnection,
  ComponentProps,
} from "streamlit-component-lib"
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
import toast, { Toaster } from "react-hot-toast"

/**
 * This is a React-based component template. The passed props are coming from the
 * Streamlit library. Your custom args can be accessed via the `args` props.
 */
function MyComponent({ args, disabled, theme }: ComponentProps): ReactElement {
  const [accountAddress, setAccountAddress] = useState<string | null>(null)
  const isConnectedToPeraWallet = !!accountAddress

  const { network, transactionsToSign, frameHeight, toastPosition } = args

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
    return transactionsToSign.map((item: string) => {
      return {
        txn: algosdk.decodeUnsignedTransaction(Buffer.from(item, "base64")),
        signers: [accountAddress],
      }
    })
  }, [transactionsToSign])

  const signTransactions = useCallback(async () => {
    Streamlit.setFrameHeight(150)
    toast("Please open the Pera Wallet app to sign this transaction.", {
      icon: "✍️",
    })
    try {
      const signedTransactions = await peraWallet.signTransaction([
        transactionSigners,
      ])
      toast("Submitting transaction to the network...", {
        icon: "✉️",
      })
      const { txid } = await algorand.client.algod
        .sendRawTransaction(signedTransactions)
        .do()
      toast.success("Transaction confirmed!", { duration: 4000 })
      console.log(`Transaction ID: ${txid}`)
      Streamlit.setComponentValue([accountAddress, txid])
    } catch (error) {
      console.log("Transaction failed:", error)
      toast.error("Transaction failed.\nSee the console for more information.")
    }
  }, [network, transactionSigners])

  useEffect(() => {
    // If web crypto API is not available
    if (!window.crypto?.subtle) {
      Streamlit.setFrameHeight(100)
      console.log(
        "Wallet is only supported in secure contexts (HTTPS). `http://localhost` is also supported by some browsers. Reference: https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts"
      )
      toast.error(
        "Wallet is only supported in secure contexts.\nSee the console for more information.",
        {
          duration: Infinity,
        }
      )
    } else {
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
    }
  }, [])

  useEffect(() => {
    Streamlit.setComponentValue([accountAddress, null])
  }, [accountAddress])

  return (
    <>
      {window.crypto?.subtle && (
        <div style={{ display: "flex", gap: "10px" }}>
          {isConnectedToPeraWallet && transactionsToSign.length !== 0 && (
            <button onClick={signTransactions}>Sign Transaction</button>
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
      {toastPosition && (
        <Toaster
          position={toastPosition}
          toastOptions={{
            style: {
              minWidth: "500px",
            },
          }}
        />
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
      .finally(() => Streamlit.setFrameHeight())
  }

  function handleDisconnectWalletClick() {
    peraWallet.disconnect()
    setAccountAddress(null)
  }
}

// "withStreamlitConnection" is a wrapper function. It bootstraps the
// connection between your component and the Streamlit app, and handles
// passing arguments from Python -> Component.
//
// You don't need to edit withStreamlitConnection (but you're welcome to!).
export default withStreamlitConnection(MyComponent)
