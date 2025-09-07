module defi_suite::yield_vault {
    use std::signer;
    use aptos_framework::fungible_asset::{Self, Metadata, FungibleAsset};
    use aptos_framework::object::Object;
    use aptos_framework::primary_fungible_store;
    use aptos_framework::timestamp;

    /// Error codes
    const E_VAULT_NOT_EXISTS: u64 = 1;
    const E_NO_STAKE: u64 = 2;
    const E_INSUFFICIENT_BALANCE: u64 = 3;

    /// Vault resource
    struct Vault has key {
        staked_token_metadata: Object<Metadata>,
        reward_token_metadata: Object<Metadata>,
        total_staked: u64,
        reward_rate_per_second: u64, // rewards per second per token
        last_update_time: u64,
        accumulated_reward_per_share: u64,
    }

    /// User stake information- Vault is created by someone
    struct UserStake has key {
        amount: u64,
        reward_debt: u64,
        last_stake_time: u64,
    }

    /// Create a new yield vault
    public entry fun create_vault(
        creator: &signer,
        staked_token: Object<Metadata>, // which token a user must stake
        reward_token: Object<Metadata>, // which token user earns aas reward 
        reward_rate: u64 
    ) {
        let vault = Vault {
            staked_token_metadata: staked_token,
            reward_token_metadata: reward_token,
            total_staked: 0,
            reward_rate_per_second: reward_rate,
            last_update_time: timestamp::now_seconds(),
            accumulated_reward_per_share: 0,
        };
        move_to(creator, vault);
    }

    /// Stake tokens in the vault
    public entry fun stake(
        user: &signer,
        vault_addr: address,
        amount: u64
    ) acquires Vault, UserStake {
        assert!(exists<Vault>(vault_addr), E_VAULT_NOT_EXISTS);
        let vault = borrow_global_mut<Vault>(vault_addr);
        let user_addr = signer::address_of(user);

        // Update vault rewards
        update_rewards(vault);

        // Transfer staked tokens from user
        let staked_fa = primary_fungible_store::withdraw(user, vault.staked_token_metadata, amount);

        // Update user stake
        if (exists<UserStake>(user_addr)) {
            let user_stake = borrow_global_mut<UserStake>(user_addr);
            
            // Calculate pending rewards before updating stake
            let pending_rewards = (user_stake.amount * vault.accumulated_reward_per_share) - user_stake.reward_debt;
            
            user_stake.amount = user_stake.amount + amount;
            user_stake.reward_debt = user_stake.amount * vault.accumulated_reward_per_share;
            user_stake.last_stake_time = timestamp::now_seconds();
        } else {
            move_to(user, UserStake {
                amount,
                reward_debt: amount * vault.accumulated_reward_per_share,
                last_stake_time: timestamp::now_seconds(),
            });
        };

        // Update vault total
        vault.total_staked = vault.total_staked + amount;

        // For simplicity, destroying the staked tokens instead of storing them
        fungible_asset::destroy_zero(staked_fa);
    }

    /// Unstake tokens from the vault
    public entry fun unstake(
        user: &signer,
        vault_addr: address,
        amount: u64
    ) acquires Vault, UserStake {
        assert!(exists<Vault>(vault_addr), E_VAULT_NOT_EXISTS);
        let vault = borrow_global_mut<Vault>(vault_addr);
        let user_addr = signer::address_of(user);
        
        assert!(exists<UserStake>(user_addr), E_NO_STAKE);
        let user_stake = borrow_global_mut<UserStake>(user_addr);
        assert!(user_stake.amount >= amount, E_INSUFFICIENT_BALANCE);

        // Update rewards
        update_rewards(vault);

        // Calculate and claim pending rewards
        let pending_rewards = (user_stake.amount * vault.accumulated_reward_per_share) - user_stake.reward_debt;
        
        // Update user stake
        user_stake.amount = user_stake.amount - amount;
        user_stake.reward_debt = user_stake.amount * vault.accumulated_reward_per_share;

        // Update vault total
        vault.total_staked = vault.total_staked - amount;

        // In a real implementation, you'd transfer the staked tokens back to the user
        // and mint/transfer reward tokens for pending_rewards
    }

    /// Claim accumulated rewards
    public entry fun claim_rewards(
        user: &signer,
        vault_addr: address
    ) acquires Vault, UserStake {
        assert!(exists<Vault>(vault_addr), E_VAULT_NOT_EXISTS);
        let vault = borrow_global_mut<Vault>(vault_addr);
        let user_addr = signer::address_of(user);
        
        assert!(exists<UserStake>(user_addr), E_NO_STAKE);
        let user_stake = borrow_global_mut<UserStake>(user_addr);

        // Update rewards
        update_rewards(vault);

        // Calculate pending rewards
        let pending_rewards = (user_stake.amount * vault.accumulated_reward_per_share) - user_stake.reward_debt;
        
        // Update reward debt
        user_stake.reward_debt = user_stake.amount * vault.accumulated_reward_per_share;

        // In a real implementation, you'd mint/transfer reward tokens here
    }

    /// Update reward calculations
    fun update_rewards(vault: &mut Vault) {
        let current_time = timestamp::now_seconds();
        if (vault.total_staked > 0) {
            let time_elapsed = current_time - vault.last_update_time;
            let total_rewards = vault.reward_rate_per_second * time_elapsed;
            vault.accumulated_reward_per_share = vault.accumulated_reward_per_share + 
                (total_rewards / vault.total_staked);
        };
        vault.last_update_time = current_time;
    }

    // View function to get user stake info
    #[view]
    public fun get_user_stake(user_addr: address): (u64, u64) acquires UserStake {
        if (exists<UserStake>(user_addr)) {
            let user_stake = borrow_global<UserStake>(user_addr);
            (user_stake.amount, user_stake.last_stake_time)
        } else {
            (0, 0)
        }
    }

    // View function to get vault info
    #[view]
    public fun get_vault_info(vault_addr: address): (u64, u64, u64) acquires Vault {
        let vault = borrow_global<Vault>(vault_addr);
        (vault.total_staked, vault.reward_rate_per_second, vault.last_update_time)
    }
}
