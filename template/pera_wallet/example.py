import streamlit as st
from pera_wallet import pera_wallet

if "account" not in st.session_state:
    st.session_state.account = None

if "transaction_id" not in st.session_state:
    st.session_state.transaction_id = None

NETWORK = "testnet"

st.title("My App")


def account():
    with st.expander("Account", expanded=True):
        # Add msgpack-encoded transactions to sign, if needed
        transactions_to_sign = []

        wallet = pera_wallet(
            network=NETWORK,
            transactions_to_sign=transactions_to_sign,
            key="pera_wallet",
        )
        if wallet is not None:
            st.session_state.account, st.session_state.transaction_id = wallet

        st.caption(
            f"Connected address: {st.session_state.account}"
            if st.session_state.account
            else "Connect your wallet to begin."
        )
        if st.session_state.transaction_id:
            st.caption(
                f"View your transaction on [lora](https://lora.algokit.io/{NETWORK}/transaction/{st.session_state.transaction_id}) the explorer 🥳"
            )


account()

if not st.session_state.account:
    st.stop()
