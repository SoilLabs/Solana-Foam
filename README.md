# Solana-Foam
Foam mint and claim script

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
