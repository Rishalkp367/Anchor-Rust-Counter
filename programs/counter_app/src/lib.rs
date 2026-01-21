use anchor_lang::prelude::*;

declare_id!("2CtNPDTHjvsPJZ9rX4R8EpVpU37FgL1G4UXCXqBeqStQ");

#[program]
pub mod counter_app {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.owner = ctx.accounts.user.key();
        counter.count = 0;
        Ok(())
    }

    pub fn increment(ctx: Context<UpdateCounter>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.count += 1;
        Ok(())
    }

    pub fn decrement(ctx: Context<UpdateCounter>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.count -= 1;
        Ok(())
    }

    pub fn reset(ctx: Context<UpdateCounter>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.count = 0;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = user, space = 8 + 32 + 8)]
    pub counter: Account<'info, Counter>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateCounter<'info> {
    #[account(mut, has_one = owner)]
    pub counter: Account<'info, Counter>,

    pub owner: Signer<'info>,
}

#[account]
pub struct Counter {
    pub owner: Pubkey,
    pub count: i64,
}
