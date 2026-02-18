
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Owner {
    System,
    Architect,
    Guest,
    Anonymous,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct Permissions {
    pub read: bool,
    pub write: bool,
    pub execute: bool,
    pub dissolve: bool, // The ultimate power (L20)
}

pub struct Access {
    pub owner: Owner,
    pub permissions: Permissions,
}

impl Access {
    pub fn new(owner: Owner, permissions: Permissions) -> Self {
        Access { owner, permissions }
    }

    /// The Architect has all keys
    pub fn sudo() -> Self {
        Access {
            owner: Owner::Architect,
            permissions: Permissions {
                read: true,
                write: true,
                execute: true,
                dissolve: true,
            },
        }
    }

    /// Check if the requestor has the required permissions
    pub fn check(&self, required: &Permissions) -> bool {
        // Optimistic check: Architect/System bypass? 
        // For now, strict explicit check unless Architect.
        if self.owner == Owner::Architect {
            return true;
        }

        let r = !required.read || self.permissions.read;
        let w = !required.write || self.permissions.write;
        let e = !required.execute || self.permissions.execute;
        let d = !required.dissolve || self.permissions.dissolve;

        r && w && e && d
    }
}
