"""Example usage of the Pera Wallet component."""

import streamlit as st

from pera_wallet import pera_wallet

if 'wallet' not in st.session_state:
    st.session_state.wallet = {'status': 'disconnected', 'address': None}

if 'txn' not in st.session_state:
    st.session_state.txn = None

NETWORK = 'testnet'

st.title('My App')


def account():
    with st.expander('Account', expanded=True):
        # Add msgpack-encoded transactions to sign, if needed
        transactions_to_sign = []

        wallet = pera_wallet(
            network=NETWORK,
            transactions_to_sign=transactions_to_sign,
            key='pera_wallet',
        )
        if wallet is not None:
            wallet_state, txn_state = wallet
            st.session_state.wallet = wallet_state
            st.session_state.txn = txn_state

            if st.session_state.txn:
                match st.session_state.txn:
                    case {'status': 'proposed'}:
                        st.info(
                            'Please open the Pera Wallet app to sign this transaction.',
                            icon='✍️',
                        )
                    case {'status': 'submitted'}:
                        st.info(
                            'Transaction submitted. Waiting for confirmation.',
                            icon='⏳',
                        )
                    case {'status': 'confirmed', 'txId': tx_id}:
                        st.success(
                            f'Transaction confirmed! View your transaction on [lora](https://lora.algokit.io/{NETWORK}/transaction/{tx_id}) the explorer.',
                            icon='🥳',
                        )
                    case {'status': 'failed', 'msg': msg}:
                        st.error(f'Transaction failed: {msg}', icon='😞')

        if st.session_state.wallet['status'] == 'unavailable':
            st.error('Wallet is only available in secure contexts (HTTPS).')
        else:
            st.caption(
                f'Connected address: {st.session_state.wallet["address"]}'
                if st.session_state.wallet['status'] == 'connected'
                else 'Connect your wallet to begin.'
            )


account()

if not st.session_state.wallet['address']:
    st.stop()
