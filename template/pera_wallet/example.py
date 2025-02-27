"""Example usage of the Pera Wallet component."""

import streamlit as st

from pera_wallet import (
    pera_wallet,
    TransactionPending,
    TransactionConfirmed,
    TransactionFailed,
    WalletConnected,
    WalletDisconnected,
)

NETWORK = "testnet"


def account() -> str | None:
    with st.expander("Account", expanded=True):
        # Add msgpack-encoded transactions to sign, if needed
        transactions_to_sign = []

        wallet, txn = pera_wallet(
            network=NETWORK,
            transactions_to_sign=transactions_to_sign,
            key="pera_wallet",
        )

        match wallet:
            case WalletDisconnected(status="unavailable"):
                st.error("Wallet is only available in secure contexts (HTTPS).")
            case WalletDisconnected(status="disconnected"):
                st.caption("Connect your wallet to begin.")
            case WalletConnected(address=address):
                st.caption(f"Connected address: {address}")

        match txn:
            case TransactionPending(status="proposed"):
                st.info(
                    "Please open the Pera Wallet app to sign this transaction.",
                    icon="✍️",
                )
            case TransactionPending(status="submitted"):
                st.info(
                    "Transaction submitted. Waiting for confirmation.",
                    icon="⏳",
                )
            case TransactionConfirmed(transaction_id=tx_id):
                st.success(
                    f"Transaction confirmed! View your transaction on [lora](https://lora.algokit.io/{NETWORK}/transaction/{tx_id}) the explorer.",
                    icon="🥳",
                )
            case TransactionFailed(msg=msg):
                st.error(f"Transaction failed: {msg}", icon="😞")

    return wallet.address


if __name__ == "__main__":
    st.title("My App")

    connected_address = account()
    if not connected_address:
        st.stop()
