import type { Principal } from '@dfinity/principal';
export interface Account {
  'owner' : Principal,
  'subaccount' : [] | [Array<number>],
}
export interface Allowance {
  'allowance' : bigint,
  'expires_at' : [] | [bigint],
}
export interface AllowanceArgs { 'account' : Account, 'spender' : Account }
export interface Approve {
  'fee' : [] | [bigint],
  'from' : Account,
  'memo' : [] | [Array<number>],
  'created_at_time' : [] | [bigint],
  'amount' : bigint,
  'expected_allowance' : [] | [bigint],
  'expires_at' : [] | [bigint],
  'spender' : Account,
}
export interface ApproveArgs {
  'fee' : [] | [bigint],
  'memo' : [] | [Array<number>],
  'from_subaccount' : [] | [Array<number>],
  'created_at_time' : [] | [bigint],
  'amount' : bigint,
  'expected_allowance' : [] | [bigint],
  'expires_at' : [] | [bigint],
  'spender' : Account,
}
export type ApproveError = {
    'GenericError' : { 'message' : string, 'error_code' : bigint }
  } |
  { 'TemporarilyUnavailable' : null } |
  { 'Duplicate' : { 'duplicate_of' : bigint } } |
  { 'BadFee' : { 'expected_fee' : bigint } } |
  { 'AllowanceChanged' : { 'current_allowance' : bigint } } |
  { 'CreatedInFuture' : { 'ledger_time' : bigint } } |
  { 'TooOld' : null } |
  { 'Expired' : { 'ledger_time' : bigint } } |
  { 'InsufficientFunds' : { 'balance' : bigint } };
export interface ArchivedRange {
  'callback' : [Principal, string],
  'start' : bigint,
  'length' : bigint,
}
export interface ArchivedRange_1 {
  'callback' : [Principal, string],
  'start' : bigint,
  'length' : bigint,
}
export interface Burn {
  'from' : Account,
  'memo' : [] | [Array<number>],
  'created_at_time' : [] | [bigint],
  'amount' : bigint,
}
export interface DataCertificate {
  'certificate' : [] | [Array<number>],
  'hash_tree' : Array<number>,
}
export interface GetBlocksRequest { 'start' : bigint, 'length' : bigint }
export interface GetBlocksResponse {
  'certificate' : [] | [Array<number>],
  'first_index' : bigint,
  'blocks' : Array<Value>,
  'chain_length' : bigint,
  'archived_blocks' : Array<ArchivedRange>,
}
export interface GetTransactionsResponse {
  'first_index' : bigint,
  'log_length' : bigint,
  'transactions' : Array<Transaction>,
  'archived_transactions' : Array<ArchivedRange_1>,
}
export interface HttpRequest {
  'url' : string,
  'method' : string,
  'body' : Array<number>,
  'headers' : Array<[string, string]>,
}
export interface HttpResponse {
  'body' : Array<number>,
  'headers' : Array<[string, string]>,
  'status_code' : number,
}
export type MetadataValue = { 'Int' : bigint } |
  { 'Nat' : bigint } |
  { 'Blob' : Array<number> } |
  { 'Text' : string };
export interface Mint {
  'to' : Account,
  'memo' : [] | [Array<number>],
  'created_at_time' : [] | [bigint],
  'amount' : bigint,
}
export type Result = { 'Ok' : bigint } |
  { 'Err' : TransferError };
export type Result_1 = { 'Ok' : bigint } |
  { 'Err' : ApproveError };
export interface StandardRecord { 'url' : string, 'name' : string }
export interface Transaction {
  'burn' : [] | [Burn],
  'kind' : string,
  'mint' : [] | [Mint],
  'approve' : [] | [Approve],
  'timestamp' : bigint,
  'transfer_from' : [] | [TransferFrom],
  'transfer' : [] | [Transfer],
}
export interface Transfer {
  'to' : Account,
  'fee' : [] | [bigint],
  'from' : Account,
  'memo' : [] | [Array<number>],
  'created_at_time' : [] | [bigint],
  'amount' : bigint,
}
export interface TransferArg {
  'to' : Account,
  'fee' : [] | [bigint],
  'memo' : [] | [Array<number>],
  'from_subaccount' : [] | [Array<number>],
  'created_at_time' : [] | [bigint],
  'amount' : bigint,
}
export type TransferError = {
    'GenericError' : { 'message' : string, 'error_code' : bigint }
  } |
  { 'TemporarilyUnavailable' : null } |
  { 'BadBurn' : { 'min_burn_amount' : bigint } } |
  { 'Duplicate' : { 'duplicate_of' : bigint } } |
  { 'BadFee' : { 'expected_fee' : bigint } } |
  { 'CreatedInFuture' : { 'ledger_time' : bigint } } |
  { 'TooOld' : null } |
  { 'InsufficientFunds' : { 'balance' : bigint } };
export interface TransferFrom {
  'to' : Account,
  'fee' : [] | [bigint],
  'from' : Account,
  'memo' : [] | [Array<number>],
  'created_at_time' : [] | [bigint],
  'amount' : bigint,
  'spender' : Account,
}
export type Value = { 'Int' : bigint } |
  { 'Map' : Array<[string, Value]> } |
  { 'Nat' : bigint } |
  { 'Nat64' : bigint } |
  { 'Blob' : Array<number> } |
  { 'Text' : string } |
  { 'Array' : Vec };
export type Vec = Array<
  { 'Int' : bigint } |
    { 'Map' : Array<[string, Value]> } |
    { 'Nat' : bigint } |
    { 'Nat64' : bigint } |
    { 'Blob' : Array<number> } |
    { 'Text' : string } |
    { 'Array' : Vec }
>;
export interface _SERVICE {
  'get_blocks' : (arg_0: GetBlocksRequest) => Promise<GetBlocksResponse>,
  'get_data_certificate' : () => Promise<DataCertificate>,
  'get_transactions' : (arg_0: GetBlocksRequest) => Promise<
      GetTransactionsResponse
    >,
  'http_request' : (arg_0: HttpRequest) => Promise<HttpResponse>,
  'icrc1_balance_of' : (arg_0: Account) => Promise<bigint>,
  'icrc1_decimals' : () => Promise<number>,
  'icrc1_fee' : () => Promise<bigint>,
  'icrc1_metadata' : () => Promise<Array<[string, MetadataValue]>>,
  'icrc1_minting_account' : () => Promise<[] | [Account]>,
  'icrc1_name' : () => Promise<string>,
  'icrc1_supported_standards' : () => Promise<Array<StandardRecord>>,
  'icrc1_symbol' : () => Promise<string>,
  'icrc1_total_supply' : () => Promise<bigint>,
  'icrc1_transfer' : (arg_0: TransferArg) => Promise<Result>,
  'icrc2_allowance' : (arg_0: AllowanceArgs) => Promise<Allowance>,
  'icrc2_approve' : (arg_0: ApproveArgs) => Promise<Result_1>,
}