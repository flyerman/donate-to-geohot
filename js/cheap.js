const CHEAPRAND_CONTRACT_ADDRESS = "0x2960d4828357772aebbCaC2C23516A7F20A34FB7"

window.addEventListener('load', function() {
  // Update contract balance
  ETHERS_PROVIDER = new ethers.providers.JsonRpcProvider("https://rpc.cheapeth.org/rpc")
  // ETHERS_PROVIDER.getBalance(GFG_CONTRACT_ADDRESS).then((value) =>
  //   document.getElementById("gfg-fund-balance").innerHTML = ethers.utils.formatUnits(value, unit = "ether")
  // )

  $.getJSON('https://raw.githubusercontent.com/CheapEthereum/LinkToken/master/abi/contracts/v0.6/CheapRand.sol/CheapRand.json', function(cheapRandAbi) {
    CHEAPRAND_CONTRACT = new ethers.Contract(CHEAPRAND_CONTRACT_ADDRESS, cheapRandAbi, ETHERS_PROVIDER)
    updateCheapRandNumber()
  });

  // detect Metamask account change
  window.ethereum.on('accountsChanged', function (accounts) {
    updateCheapRandNumber();
  })

  // detect Network account change
  window.ethereum.on('chainChanged', function(networkId) {
    updateCheapRandNumber();
  })
})

async function updateCheapRandNumber() {
  if (!CHEAPRAND_CONTRACT) {
    return;
  }
  CHEAPRAND_CONTRACT.number().then((cheapNumber) => {
    document.getElementById("gfg-fund-balance").innerHTML = cheapNumber
  })
}

async function drawCheapNumber() {
  const account = await getAccount();
  if (account) {
    await drawCheapNumber(account);
  }
}

async function getAccount() {
  // ask which account the user intends to use
  const accounts = await ethereum.request({ method: "eth_requestAccounts" });
  return accounts[0];
}

function connectMetaMask() {
  getAccount().then((value) =>
    updateCheapRandNumber()
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

async function drawCheapNumber(account) {

  if (!ethereum.selectedAddress || !CHEAPRAND_CONTRACT) {
    return;
  }

  SIGNER = (new ethers.providers.Web3Provider(window.ethereum)).getSigner()
  SIGNED_CHEAPRAND_CONTRACT = CHEAPRAND_CONTRACT.connect(SIGNER)

  SIGNED_CHEAPRAND_CONTRACT.requestCheapNumber().then(() => {
    alert("New Cheap Number is on its way!");
  }).catch((err) => {
    console.error(err.message);
    alert(`${err.message}`);
  });
}
