
use std::collections::HashMap;

#[derive(Debug, Clone, PartialEq)]
pub enum ProposalStatus {
    Active,
    Passed,
    Rejected,
    PendingEnactment,
}

#[derive(Debug, Clone)]
pub struct Proposal {
    pub id: String,
    pub description: String,
    pub votes_for: u32,
    pub votes_against: u32,
    pub status: ProposalStatus,
}

pub struct Governance {
    pub swarm_size: u32,
    pub proposals: HashMap<String, Proposal>,
}

impl Governance {
    pub fn new(swarm_size: u32) -> Self {
        Governance {
            swarm_size,
            proposals: HashMap::new(),
        }
    }

    /// Create a new proposal for the swarm
    pub fn propose(&mut self, id: &str, desc: &str) -> String {
        if self.proposals.contains_key(id) {
            return "ERROR: Proposal ID exists".to_string();
        }
        
        self.proposals.insert(id.to_string(), Proposal {
            id: id.to_string(),
            description: desc.to_string(),
            votes_for: 0,
            votes_against: 0,
            status: ProposalStatus::Active,
        });
        format!("PROPOSAL_SUBMITTED: [{}] {}", id, desc)
    }

    /// Cast a vote on an active proposal
    pub fn vote(&mut self, proposal_id: &str, approve: bool) -> String {
        if let Some(prop) = self.proposals.get_mut(proposal_id) {
            if prop.status != ProposalStatus::Active {
                return "ERROR: Voting Closed/Decided".to_string();
            }
            
            if approve { 
                prop.votes_for += 1; 
            } else { 
                prop.votes_against += 1; 
            }
            
            self.check_consensus(proposal_id)
        } else {
            "ERROR: Proposal not found".to_string()
        }
    }

    /// Check if quorum is met and decide
    fn check_consensus(&mut self, proposal_id: &str) -> String {
        if let Some(prop) = self.proposals.get_mut(proposal_id) {
            let total_votes = prop.votes_for + prop.votes_against;
            // Simple Majority Quorum logic (> 50% of swarm must vote to decide)
            let quorum = (self.swarm_size as f32 / 2.0).ceil() as u32;

            if total_votes >= quorum {
                if prop.votes_for > prop.votes_against {
                    prop.status = ProposalStatus::Passed;
                    return format!("CONSENSUS REACHED: Proposal '{}' PASSED. ({} vs {})", prop.id, prop.votes_for, prop.votes_against);
                } else if prop.votes_against > prop.votes_for {
                    prop.status = ProposalStatus::Rejected;
                     return format!("CONSENSUS REACHED: Proposal '{}' REJECTED. ({} vs {})", prop.id, prop.votes_for, prop.votes_against);
                }
                // Tie: Keep open or wait for more votes
                return "VOTE_RECORDED: Tie (Waiting for Tiebreaker)".to_string();
            }
            format!("VOTE_RECORDED: Progress {}/{} for Quorum.", total_votes, quorum)
        } else {
            "ERROR".to_string()
        }
    }
}
