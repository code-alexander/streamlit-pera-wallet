import pytest

from pera_wallet import (
    parse_wallet,
    parse_txn,
    TransactionPending,
    TransactionConfirmed,
    TransactionFailed,
    WalletConnected,
    WalletDisconnected,
    WalletState,
    TransactionState,
)


@pytest.mark.parametrize(
    "wallet, expected",
    [
        (
            {"status": "connected", "address": "test_address"},
            WalletConnected(status="connected", address="test_address"),
        ),
        (
            {"status": "unavailable", "address": None},
            WalletDisconnected(status="unavailable", address=None),
        ),
        (
            {"status": "disconnected", "address": None},
            WalletDisconnected(status="disconnected", address=None),
        ),
    ],
)
def test_parse_wallet(wallet: dict, expected: WalletState):
    """Test the parse_wallet function.

    Args:
        wallet (dict): The wallet dict.
        expected (WalletState): The expected wallet state.
    """
    assert parse_wallet(wallet) == expected


@pytest.mark.parametrize(
    "txn, expected",
    [
        (
            {"status": "proposed", "transaction_id": None},
            TransactionPending(status="proposed", transaction_id=None),
        ),
        (
            {"status": "signed", "transaction_id": None},
            TransactionPending(status="signed", transaction_id=None),
        ),
        (
            {"status": "submitted", "transaction_id": None},
            TransactionPending(status="submitted", transaction_id=None),
        ),
        (
            {"status": "confirmed", "transaction_id": "test_tx_id"},
            TransactionConfirmed(status="confirmed", transaction_id="test_tx_id"),
        ),
        (
            {"status": "failed", "msg": "test_msg"},
            TransactionFailed(status="failed", msg="test_msg"),
        ),
        ({}, None),
    ],
)
def test_parse_txn(txn: dict, expected: TransactionState | None):
    """Test the parse_txn function.

    Args:
        txn (dict): The txn dict.
        expected (TransactionState | None): The expected transaction state or None.
    """
    assert parse_txn(txn) == expected
