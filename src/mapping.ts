import { BigInt, Address } from "@graphprotocol/graph-ts"
import {
  ClaimReward,
  Staked,
  Unstake,
} from "../generated/StakingToken/StakingToken"
import { StakingUser, StakingHistory } from "../generated/schema"

export function handleClaimReward(event: ClaimReward): void {
  let user = getUser(event.params.user, event.block.timestamp);
  let amount = event.params.reward;

  createHistory(event.transaction.hash.toHexString(), "ClaimReward", amount, user, event.block.timestamp);
}

export function handleStaked(event: Staked): void {
  let user = getUser(event.params.user, event.block.timestamp);

  user.stakedAmount = user.stakedAmount.plus(event.params.amount);
  user.updatedAtTimestamp = event.block.timestamp;
  user.save();

  createHistory(event.transaction.hash.toHex(), "Stake", event.params.amount, user, event.block.timestamp);
}

export function handleUnstake(event: Unstake): void {
  let user = getUser(event.params.user, event.block.timestamp);

  user.stakedAmount = user.stakedAmount.minus(event.params.amount);
  user.updatedAtTimestamp = event.block.timestamp;
  user.save();

  createHistory(event.transaction.hash.toHex(), "Unstake", event.params.amount, user, event.block.timestamp);
}


function getUser(address: Address, timestamp: BigInt): StakingUser {
  let user = StakingUser.load(address.toHexString());
  if (user == null) {
    user = new StakingUser(address.toHexString());
    user.stakedAmount = BigInt.fromI32(0);
    user.createdAtTimestamp = timestamp;
    user.save();
  }

  return user;
}

function createHistory(hash:string, type: string, amount: BigInt, user: StakingUser, timestamp: BigInt): void {
  let history = new StakingHistory(hash.toLowerCase());
  history.amount = amount;
  history.type = type;
  history.createdAtTimestamp = timestamp;
  history.user = user.id;
  history.save();
}
