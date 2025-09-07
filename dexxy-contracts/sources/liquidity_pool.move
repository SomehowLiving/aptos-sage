module defi_suite::liquidity_pool {
    use std::signer;
    use aptos_framework::fungible_asset::{Self, Metadata};
    use aptos_framework::object::{Self, Object};
    use aptos_framework::primary_fungible_store;
    use aptos_std::math64;

    /// Error codes
    const E_POOL_EXISTS: u64 = 1;
    const E_POOL_NOT_EXISTS: u64 = 2;
    const E_INSUFFICIENT_LIQUIDITY: u64 = 3;
    const E_INSUFFICIENT_AMOUNT: u64 = 4;
    const E_IDENTICAL_TOKENS: u64 = 5;

    /// Pool resource storing reserves and metadata
    struct Pool has key {
        token_x_metadata: Object<Metadata>,
        token_y_metadata: Object<Metadata>,
        reserve_x: u64,
        reserve_y: u64,
        total_shares: u64,
    }

    /// LP token shares for users
    struct LPShares has key {
        shares: u64,
    }

    /// Create a new liquidity pool
    public entry fun create_pool(
        creator: &signer,
        // what tokens this pool supports.
        token_x: Object<Metadata>,
        token_y: Object<Metadata>
    ) {
        let creator_addr = signer::address_of(creator);
        assert!(!exists<Pool>(creator_addr), E_POOL_EXISTS);
        assert!(token_x != token_y, E_IDENTICAL_TOKENS);

        let pool = Pool {
            token_x_metadata: token_x,
            token_y_metadata: token_y,
            reserve_x: 0,
            reserve_y: 0,
            total_shares: 0, // total LP tokens issued
        };
        move_to(creator, pool);
    }

    /// Add liquidity to the pool
    public entry fun add_liquidity(
        user: &signer,
        pool_addr: address,
        // Users deposit amounts of Token X and Token Y.
        amount_x: u64,
        amount_y: u64
    ) acquires Pool, LPShares {
        assert!(exists<Pool>(pool_addr), E_POOL_NOT_EXISTS);
        let pool = borrow_global_mut<Pool>(pool_addr);
        let user_addr = signer::address_of(user);

        // Transfer tokens from user to pool
        let fa_x = primary_fungible_store::withdraw(user, pool.token_x_metadata, amount_x);
        let fa_y = primary_fungible_store::withdraw(user, pool.token_y_metadata, amount_y);

        // Update reserves (in a real implementation, you'd store these tokens)
        pool.reserve_x = pool.reserve_x + amount_x;
        pool.reserve_y = pool.reserve_y + amount_y;

        // Calculate LP shares (simplified)
        let shares = if (pool.total_shares == 0) {
            // First liquidity provider gets sqrt(x * y) shares
            math64::sqrt(amount_x * amount_y)
        } else {
            // Subsequent providers get proportional shares
            math64::min(
                (amount_x * pool.total_shares) / pool.reserve_x,
                (amount_y * pool.total_shares) / pool.reserve_y
            )
        };

        pool.total_shares = pool.total_shares + shares;

        // Store user's LP shares
        if (exists<LPShares>(user_addr)) {
            let user_shares = borrow_global_mut<LPShares>(user_addr);
            user_shares.shares = user_shares.shares + shares;
        } else {
            move_to(user, LPShares { shares });
        };

        // For simplicity, we're not actually storing the deposited tokens
        // In a real implementation, you'd need to handle token storage properly
        fungible_asset::destroy_zero(fa_x);
        fungible_asset::destroy_zero(fa_y);
    }

    /// Swap token X for token Y
    public entry fun swap_x_for_y(
        user: &signer,
        pool_addr: address,
        amount_x_in: u64,
        min_y_out: u64
    ) acquires Pool {
        assert!(exists<Pool>(pool_addr), E_POOL_NOT_EXISTS);
        let pool = borrow_global_mut<Pool>(pool_addr);

        // Calculate output using constant product formula (x * y = k)
        let amount_y_out = get_amount_out(amount_x_in, pool.reserve_x, pool.reserve_y);
        assert!(amount_y_out >= min_y_out, E_INSUFFICIENT_AMOUNT);

        // Transfer input token from user
        let fa_x = primary_fungible_store::withdraw(user, pool.token_x_metadata, amount_x_in);

        // Update reserves
        pool.reserve_x = pool.reserve_x + amount_x_in;
        pool.reserve_y = pool.reserve_y - amount_y_out;

        // Transfer output token to user (simplified - not actually transferring)
        // In real implementation, you'd withdraw from pool's stored tokens
        
        fungible_asset::destroy_zero(fa_x);
    }

    /// Helper function to calculate output amount
    fun get_amount_out(amount_in: u64, reserve_in: u64, reserve_out: u64): u64 {
        let amount_in_with_fee = amount_in * 997; // 0.3% fee
        let numerator = amount_in_with_fee * reserve_out;
        let denominator = reserve_in * 1000 + amount_in_with_fee;
        numerator / denominator
    }

    // Get pool reserves (view function)
    #[view]
    public fun get_reserves(pool_addr: address): (u64, u64) acquires Pool {
        let pool = borrow_global<Pool>(pool_addr);
        (pool.reserve_x, pool.reserve_y)
    }
}
