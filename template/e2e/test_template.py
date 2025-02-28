from pathlib import Path

import pytest
from e2e_utils import StreamlitRunner
from playwright.sync_api import Page, expect

ROOT_DIRECTORY = Path(__file__).parent.parent.absolute()
BASIC_EXAMPLE_FILE = ROOT_DIRECTORY / "pera_wallet" / "example.py"


@pytest.fixture(autouse=True, scope="module")
def streamlit_app():
    with StreamlitRunner(BASIC_EXAMPLE_FILE) as runner:
        yield runner


@pytest.fixture(autouse=True, scope="function")
def go_to_app(page: Page, streamlit_app: StreamlitRunner):
    page.goto(streamlit_app.server_url)
    # Wait for app to load
    page.get_by_role("img", name="Running...").is_hidden()


def test_pera_wallet_modal(page: Page):
    """Test that the Pera Wallet modal is visible and contains the necessary elements.

    Args:
        page (Page): Playwright page object.
    """
    frame = page.frame_locator('iframe[title="pera_wallet\\.pera_wallet"]').nth(0)

    expect(frame.get_by_role("button", name="Connect Pera Wallet")).to_be_visible()
    frame.get_by_role("button", name="Connect Pera Wallet").click()

    expect(frame.get_by_role("img", name="Pera Wallet Logo")).to_be_visible()
    expect(
        frame.locator("#pera-wallet-connect-modal-connect-qr-code image")
    ).to_be_visible()
