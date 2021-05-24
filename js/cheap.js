const GFG_CONTRACT_ADDRESS = "0x891f4cda9738e0e77d5a12cd209edb9cbfae30c7"

window.addEventListener('load', function() {
  // Update contract balance
  ETHERS_PROVIDER = new ethers.providers.JsonRpcProvider("https://rpc.cheapeth.org/rpc")
  ETHERS_PROVIDER.getBalance(GFG_CONTRACT_ADDRESS).then((value) =>
    document.getElementById("gfg-fund-balance").innerHTML = ethers.utils.formatUnits(value, unit = "ether")
  )

  $.getJSON('https://raw.githubusercontent.com/CheapEthereum/GoFundGeohot/master/data/abi/GoFundGeohot.json', function(gfgAbi) {
    GFG_CONTRACT = new ethers.Contract(GFG_CONTRACT_ADDRESS, gfgAbi, ETHERS_PROVIDER)
    updateDonorBalance()
  });

  // detect Metamask account change
  window.ethereum.on('accountsChanged', function (accounts) {
    updateDonorBalance();
  })

  // detect Network account change
  window.ethereum.on('chainChanged', function(networkId) {
    updateDonorBalance();
  })
})

async function updateDonorBalance() {
  if (!ethereum.selectedAddress || !GFG_CONTRACT) {
    return;
  }
  GFG_CONTRACT.getBalance(ethereum.selectedAddress).then((donorBalance) => {
    // Save it for unDonate()
    DONOR_BALANCE = donorBalance
    donorBalance = ethers.utils.formatUnits(donorBalance, unit = "ether")
    document.getElementById("gfg-donor-balance").innerHTML = "You donated " + donorBalance + " cTH."
    document.getElementById("undonateButton").innerHTML = "Get my " + donorBalance + " back!"
    SIGNER = (new ethers.providers.Web3Provider(window.ethereum)).getSigner()
    SIGNED_GFG_CONTRACT = GFG_CONTRACT.connect(SIGNER)
  })
}

async function donate() {
  const account = await getAccount();
  const value = getValue();
  if (value && account) {
    await performDonation(value, account);
  }
}

async function getAccount() {
  // ask which account the user intends to use
  const accounts = await ethereum.request({ method: "eth_requestAccounts" });
  return accounts[0];
}

function connectMetaMask() {
  getAccount().then((value) =>
    updateDonorBalance()
  )
}

function getValue() {
  // get the donation value inserted by the user
  donationInput = document.getElementById("donation-input");
  const amount = donationInput.value;
  if (isNaN(amount) || amount === '') {
    donationInput.style.borderColor = "red";
    donationInput.style.borderWidth = "thick";
    donationInput.value = "";
    donationInput.setAttribute("placeholder", "Please enter a proper number!");
    return false;
  }
  donationInput.style.borderColor = "";
  return ethers.utils.parseEther(amount, "ether");
}

async function performDonation(value, account) {
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
          to: GFG_CONTRACT_ADDRESS, // george
          value: value.toHexString(),
          gas: "0x15F90", // 90000 int
          data: "0xed88c68e",
        },
      ],
    })
    .then((response) => {
      console.log(`${response}`);
      handleDonationSuccess();
    })
    .catch((err) => {
      console.error(err.message);
      alert(`${err.message}`);
      handleDonnationError();
    });
}

function handleDonationSuccess() {
  donationInput = document.getElementById("donation-input");
  donationInput.style.borderColor = "green";
  donationInput.style.borderWidth = "thick";
  donationInput.value = "";
  donationInput.setAttribute("placeholder", "Thanks for your contribution!");
}

function handleDonnationError() {
  donationInput = document.getElementById("donation-input");
  donationInput.style.borderColor = "red";
  donationInput.style.borderWidth = "thick";
  donationInput.value = "";
  donationInput.setAttribute("placeholder", "Something is wrong!");
}

async function unDonate() {
  if (!DONOR_BALANCE) {
    alert("Connect your account first!")
    return;
  }
  if (!ethereum.selectedAddress || !GFG_CONTRACT) {
    return;
  }
  SIGNED_GFG_CONTRACT.unDonate(DONOR_BALANCE).then(() => {
    alert("You got your money back!");
  }).catch((err) => {
    console.error(err.message);
    alert(`${err.message}`);
  });
}
