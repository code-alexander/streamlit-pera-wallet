# pera_wallet

A Streamlit component that allows you to connect to Pera Wallet.

The component source code is in `streamlit-pera-wallet/template/`

## Installation instructions

```sh
pip install pera-wallet
```

## Usage instructions

```python
import streamlit as st
from pera_wallet import pera_wallet

if "account" not in st.session_state:
    st.session_state.account = None

if "transaction_id" not in st.session_state:
    st.session_state.transaction_id = None

NETWORK = "testnet"

st.title("Chat")


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
```

# Streamlit Component Templates

This repo contains templates and example code for creating [Streamlit](https://streamlit.io) Components.

For complete information, please see the [Streamlit Components documentation](https://docs.streamlit.io/en/latest/streamlit_components.html)!

## Overview

A Streamlit Component is made out of a Python API and a frontend (built using any web tech you prefer).

A Component can be used in any Streamlit app, can pass data between Python and frontend code, and and can optionally be distributed on [PyPI](https://pypi.org/) for the rest of the world to use.

- Create a component's API in a single line of Python:

```python
import streamlit.components.v1 as components

# Declare the component:
my_component = components.declare_component("my_component", path="frontend/build")

# Use it:
my_component(greeting="Hello", name="World")
```

- Build the component's frontend out of HTML and JavaScript (or TypeScript, or ClojureScript, or whatever you fancy). React is supported, but not required:

```typescript
class MyComponent extends StreamlitComponentBase {
  public render(): ReactNode {
    // Access arguments from Python via `this.props.args`:
    const greeting = this.props.args["greeting"];
    const name = this.props.args["name"];
    return (
      <div>
        {greeting}, {name}!
      </div>
    );
  }
}
```

## Quickstart

- Ensure you have [Python 3.6+](https://www.python.org/downloads/), [Node.js](https://nodejs.org), and [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) installed.
- Clone this repo.
- Create a new Python virtual environment for the template:

```
$ cd template
$ python3 -m venv venv  # create venv
$ . venv/bin/activate   # activate venv
$ pip install streamlit # install streamlit
```

- Initialize and run the component template frontend:

```
$ cd template/my_component/frontend
$ npm install    # Install npm dependencies
$ npm run start  # Start the Webpack dev server
```

- From a separate terminal, run the template's Streamlit app:

```
$ cd template
$ . venv/bin/activate  # activate the venv you created earlier
$ pip install -e . # install template as editable package
$ streamlit run my_component/example.py  # run the example
```

- If all goes well, you should see something like this:
  ![Quickstart Success](quickstart.png)
- Modify the frontend code at `my_component/frontend/src/MyComponent.tsx`.
- Modify the Python code at `my_component/__init__.py`.

## Examples

See the `template-reactless` directory for a template that does not use [React](https://reactjs.org/).

See the `examples` directory for examples on working with pandas DataFrames, integrating with third-party libraries, and more.

## Community-provided Templates

These templates are provided by the community. If you run into any issues, please file your issues against their repositories.

- [streamlit-component-svelte-template](https://github.com/93degree/streamlit-component-svelte-template) - [@93degree](https://github.com/93degree)
- [streamlit-component-vue-vite-template](https://github.com/gabrieltempass/streamlit-component-vue-vite-template) - [@gabrieltempass](https://github.com/gabrieltempass)
- [streamlit-component-template-vue](https://github.com/andfanilo/streamlit-component-template-vue) - [@andfanilo](https://github.com/andfanilo)
- [streamlit-component-template-react-hooks](https://github.com/whitphx/streamlit-component-template-react-hooks) - [@whitphx](https://github.com/whitphx)

## Contributing

If you want to contribute to this project, `./dev.py` script will be helpful for you. For details, run `./dev.py --help`.

## More Information

- [Streamlit Components documentation](https://docs.streamlit.io/library/components)
- [Streamlit Forums](https://discuss.streamlit.io/tag/custom-components)
- [Streamlit Components gallery](https://www.streamlit.io/components)
