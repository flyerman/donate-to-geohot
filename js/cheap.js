window.addEventListener('load', function() {
  if (typeof web3 !== 'undefined') {
    console.log('web3 is enabled')
    if (web3.currentProvider.isMetaMask === true) {
      console.log('MetaMask is active')
    } else {
      alert('MetaMask is not available, please install MetaMask extension')
    }
  } else {
    alert('Web3 is not found. Please install MetaMask extension')
  }
})

async function donate() {
  const account = await getAccount();
  const value = getValue();
  if (value && account) {
    await performTransaction(value, account);
  }
}

async function getAccount() {
  // ask which account the user intends to use
  const accounts = await ethereum.request({ method: "eth_requestAccounts" });
  return accounts[0];
}

function getValue() {
  // get the donation value inserted by the user
  const amount = document.getElementById("donation-input").value;
  if (isNaN(amount) || amount === '') {
    document.getElementById("donation-input").value =
      "Please insert proper value!";
    return false;
  }
  return parseInt(Web3.utils.toWei(amount, "ether")).toString(16);
}

async function performTransaction(value, account) {
  /*
  perform the actual transaction
  from: the account selected by the user, returned by metamask
  to: the smart contract addr
  value: donation value, properly adjusted
  gas: hex version of the fixed value I found on the python script
  data: value we need to perform the transaction to the contract (I guess?)
  */
  await ethereum
    .request({
      method: "eth_sendTransaction",
      params: [
        {
          from: account,
          to: "0x891f4cda9738e0e77d5a12cd209edb9cbfae30c7", // george
          value: value,
          gas: "0x15F90", // 90000 int
          data: "0xed88c68e",
        },
      ],
    })
    .then((response) => {
      console.log(`${response}`);
      handleSuccess();
    })
    .catch((err) => {
      console.error(err.message);
      alert(`${err.message}`);
      handleError();
    });
}

function handleSuccess() {
  document.getElementById("donation-input").value =
    "Thanks for your contribution!";
}

function handleError() {
  document.getElementById("donation-input").value = "Something is wrong!";
}

function comingSoon() {
  alert("Coming Soon!");
}
