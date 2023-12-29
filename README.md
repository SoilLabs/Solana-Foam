# Solana-Foam
Foam mint and claim script

## Rage Mode Data
Winning numbers (arithmetic sequence mechanism):

    1809 2469 3129 3789 4449 5109 5769 6429 7089 7749 8409 9069 9729 10389 11049 11709 12369 13029 13689 14349
    
      Num	tx_signer
      1809	FWE8qytqwu5HsU3qdzRhZ86tMjfwM56GdJzcD5SGpipS
      2469	QKypUcnD5Cw6BhVGqP1sjqzoS6Rr3W3rjVwbmicVEAD
      3129	7ikGSgNT5YDr49oScMjVP1pdLQM8ZRB1yBYVXMZiHTn1
      3789	6pTQEmQYwAHpa9LvJGnQTt8JZkz5ZMahUojUwE76aYW6
      4449	9X9DJc6s8oKsb43oMqZsYr3gj9iDsLgeS9rfs18jArfY
      5109	5UZxTGyUnGUqvwY1V4N1sV4hydfyt8FGuKqtveMFVGCH
      5769	FrfUoxYwXcrhj5Eo1SFKGy3GBnUj1NH3rtQ6Caodgskp
      6429	3DNFuumCLnoc7kAebNnXJk2jP4vmykDa2ZznQDKQ55Pd
      7089	AKg2Re2JaDkACU5uDgusq9A93DXZ3tQA6Rj3mp2p5kfx
      7749	92JsdRRPiYRTVZoS5PA5hcRY23o9TQzyBQhx5JMT8RGq
      8409	E7KYjNm7EsYTNtNorduAPMSNRfUNSGkc7woRX6T2hFpv
      9069	AGPz3R1V3nXB8krfSCddgPQxjhCe26TtTzVpAXmeLTak
      9729	4J1vZerYXSd5PWPuy2QGCSRLaTR1ydio4NcCMSidXCWb
      10389	BjgmooEKjPVwHdW6DngSYW9cAB2sr3QiCRuXdqxT75QG
      11049	BKV32qrDhQRwSasr37WJBnzhBRxEKVegZxhwphUUKbCs
      11709	DNCjoLSRuycbWHK4D4KVi5FoaHza4LKXGbQZDAj2uvC3
      12369	E7KYjNm7EsYTNtNorduAPMSNRfUNSGkc7woRX6T2hFpv
      13029	AfwgFoeu5xkcFxaYqyTiC3QiVpfPWq1grnKEcvRTmNx7
      13689	Ch6zvXMth7CeUFVbn9nPtWE71SJNNkagpJQKgbe1H94m
      14349	BEqU5hkqLTas5iopni8NmqtWiP7bdkK8paaf9xCoSfxB


Dune.com query sql 
```
select
      block_time,
      block_slot,
      tx_index,
      outer_executing_account,
      executing_account,
      data,
      tx_signer,
      tx_success,
      log_messages,
      0.000005 as fee,
      tx_id
    from
      solana.instruction_calls
    where
      block_slot >= 238651704
      and executing_account = 'BFEtYvLqoWfj15xwapzoN62xHedP4AS718v36RCj9vKe'
      and data = 0x5e6670ef835f211d
      and tx_success = true
      order by block_slot asc ,tx_index asc
```

## Lottery code
```
//step to next block
if sys_info.current_block != Clock::get().unwrap().slot {
            //previous block has address join
            if sys_info.join_number != 0 {
                let recent_slothashes: &UncheckedAccount<'_> = &ctx.accounts.recent_slothashes;
                let data: std::cell::Ref<'_, &mut [u8]> = recent_slothashes.data.borrow();
                let most_recent: &[u8; 8] = array_ref![data, 12, 8];
                // seed for the random number is a combination of the slot_hash - timestamp
                let seed: u64 = u64::from_le_bytes(*most_recent)
                    .saturating_sub(Clock::get().unwrap().unix_timestamp as u64);

                let reward_index: usize = (seed % sys_info.join_number) as usize;
                let reward_times: usize = epoch_info.reward_times as usize;
                epoch_info.reward_block[reward_times] = sys_info.current_block;
                epoch_info.reward_pubkey[reward_times] = sys_info.join_pubkey[reward_index];
                epoch_info.reward_times += 1;
                sys_info.current_block = Clock::get().unwrap().slot;
                sys_info.join_number = 0;
            }
}
```

## How to run the script
1. install Node.js(v18+):
        
        download and install nodejs https://nodejs.org/download/release/v18.19.0/

2. download script:

        download script from https://codeload.github.com/SoilLabs/Solana-Foam/zip/refs/heads/main

3. unzip script and change directory to the folders:

        cd Solana-Foam-main

4. Install the dependencies

        npm install

5. Fill in your information in the index.mjs

        edit index.mjs and input your information
        
6. Run the script:

        node index.mjs
