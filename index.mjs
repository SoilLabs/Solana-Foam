import { SYSVAR_SLOT_HASHES_PUBKEY, SYSVAR_INSTRUCTIONS_PUBKEY } from '@solana/web3.js';
import * as anchor from "@coral-xyz/anchor";
import { BN } from "bn.js"
import Ftd from "./ftd.json" assert { type: "json" };
//----------------------------------------------------
//input your solana private key
const privateKey = '';
//the times you want to mint
let times = 10000;
//interval second
const sleepSecond = 2;

//input your inviter's solana address
//if not, keep the default
const inviterAddress = '11111111111111111111111111111112';

//Solana endpoint
const endpoint = 'https://api.mainnet-beta.solana.com';
//----------------------------------------------------
const slotsPerEpoch = 500;

const getProvider = () => {
  const connection = new anchor.web3.Connection(endpoint, 'processed');
  const keypair = anchor.web3.Keypair.fromSecretKey(anchor.utils.bytes.bs58.decode(privateKey))
  const wallet = new anchor.Wallet(keypair);
  console.log('your address: ', wallet.publicKey.toString())
  const provider = new anchor.AnchorProvider(connection, wallet, { commitment: 'processed', preflightCommitment: 'processed' });
  return provider;
};

const sleep = () => {
  return new Promise((resolve) => setTimeout(resolve, sleepSecond * 1000));
}
const provider = getProvider();
// if the provider returns valid provider then the Ftd.metadata.address will not gives empty

const program = new anchor.Program(Ftd, Ftd.metadata.address, provider);
// const program = new anchor.Program(Ftd, Ftd.metadata.address, getProvider());

// in case of above code is also shown an empty then try this below code
/* 
const metadata = Ftd();
const program = new anchor.Program(Ftd, metadata.address, getProvider()); 
*/


const sysInfoAddr = (anchor.web3.PublicKey.findProgramAddressSync([anchor.utils.bytes.utf8.encode("SysInfo"),], program.programId))[0]
const userSummaryAddr = (anchor.web3.PublicKey.findProgramAddressSync([anchor.utils.bytes.utf8.encode("UserSummary"), program.provider.wallet.publicKey.toBuffer()], program.programId))[0]
const dividendDataAddr = (anchor.web3.PublicKey.findProgramAddressSync([anchor.utils.bytes.utf8.encode("DividendData"),], program.programId))[0]

let inviterInfoAddr = (anchor.web3.PublicKey.findProgramAddressSync([anchor.utils.bytes.utf8.encode("InviterInfo"), new anchor.web3.PublicKey(inviterAddress).toBuffer()], program.programId))[0]

let userSummary = await program.account.userSummary.getAccountInfo(userSummaryAddr);
let inviterInfo = await program.account.inviterInfo.getAccountInfo(inviterInfoAddr);

if (userSummary != null) {
  const invitedFrom = program.coder.accounts.decode('UserSummary', userSummary.data).invitedFrom;
  inviterInfoAddr = (anchor.web3.PublicKey.findProgramAddressSync([anchor.utils.bytes.utf8.encode("InviterInfo"), new anchor.web3.PublicKey(invitedFrom).toBuffer()], program.programId))[0]
} else if (inviterInfo == null) {
  inviterInfoAddr = (anchor.web3.PublicKey.findProgramAddressSync([anchor.utils.bytes.utf8.encode("InviterInfo"), new anchor.web3.PublicKey('11111111111111111111111111111111').toBuffer()], program.programId))[0]
}

const getReward = async () => {
  try {
    let userSummary = await program.account.userSummary.getAccountInfo(userSummaryAddr);
    if (userSummary == null) return;
    const dst_epoch = program.coder.accounts.decode('UserSummary', userSummary.data).unclaimedEpochs[0];
    const epochInfoAddr = (anchor.web3.PublicKey.findProgramAddressSync([anchor.utils.bytes.utf8.encode("EpochInfo"), anchor.utils.bytes.utf8.encode(new BN(dst_epoch).toString())], program.programId))[0]
    const userEpochInfoAddr = (anchor.web3.PublicKey.findProgramAddressSync([anchor.utils.bytes.utf8.encode("UserEpochInfo"), anchor.utils.bytes.utf8.encode(new BN(dst_epoch).toString()), program.provider.wallet.publicKey.toBuffer()], program.programId))[0]
    const tx = await program.methods.claim().accounts({
      sysInfo: sysInfoAddr,
      epochInfo: epochInfoAddr,
      userEpochInfo: userEpochInfoAddr,
      userSummary: userSummaryAddr,
      dividendData: dividendDataAddr,
      inviterInfo: inviterInfoAddr
    }).preInstructions([anchor.web3.ComputeBudgetProgram.setComputeUnitLimit({ units: 1400000, })]).rpc()
    console.log('getReward tx: ', tx)
  } catch (e) {
    console.log('No reward or waiting for the next epoch claim.')
  }
}

await getReward()
while (times-- > 0) {
  try {
    if (times % 5 == 0) await getReward()
    const slot = await program.provider.connection.getSlot();
    const epochInfoAddr = (anchor.web3.PublicKey.findProgramAddressSync([anchor.utils.bytes.utf8.encode("EpochInfo"), anchor.utils.bytes.utf8.encode(new BN(slot).div(new BN(slotsPerEpoch)).toString())], program.programId))[0]
    const userEpochInfoAddr = (anchor.web3.PublicKey.findProgramAddressSync([anchor.utils.bytes.utf8.encode("UserEpochInfo"), anchor.utils.bytes.utf8.encode(new BN(slot).div(new BN(slotsPerEpoch)).toString()), program.provider.wallet.publicKey.toBuffer()], program.programId))[0]
    console.log('current slot', slot)
    var tx = program.methods.mintftd().accounts({
      sysInfo: sysInfoAddr,
      userSummary: userSummaryAddr,
      epochInfo: epochInfoAddr,
      userEpochInfo: userEpochInfoAddr,
      recentSlothashes: SYSVAR_SLOT_HASHES_PUBKEY,
      instructions: SYSVAR_INSTRUCTIONS_PUBKEY,
      inviterInfo: inviterInfoAddr
    }).preInstructions([anchor.web3.ComputeBudgetProgram.setComputeUnitLimit({ units: 1400000, })]).rpc()
    console.log('mintftd tx: ', await tx)
  } catch (e) {
    console.log('mintftd error: ', e.message)
  }
  await sleep()
}