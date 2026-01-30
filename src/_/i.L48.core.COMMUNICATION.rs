
#[derive(Debug, Clone)]
pub struct Signal {
    pub payload: String,
    pub integrity_hash: u64,
}

#[derive(Debug, Clone, PartialEq)]
pub enum ChannelState {
    Closed,
    Handshake,
    Open,
    Secure,
}

pub struct Channel {
    pub state: ChannelState,
    pub buffer: Vec<Signal>,
}

pub struct Communication {
    pub channel: Channel,
}

impl Communication {
    pub fn new() -> Self {
        Communication {
            channel: Channel {
                state: ChannelState::Closed,
                buffer: Vec::new(),
            },
        }
    }

    /// Initiate handshake protocol
    pub fn handshake(&mut self) -> String {
        self.channel.state = ChannelState::Handshake;
        "SYN... Handshake Initiated".to_string()
    }

    /// Establish secure connection
    pub fn establish(&mut self) -> String {
        if self.channel.state == ChannelState::Handshake {
            self.channel.state = ChannelState::Secure;
            "ACK... Channel SECURE. Ready for transmission.".to_string()
        } else {
            "ERROR: Handshake required.".to_string()
        }
    }

    /// Encode and transmit a signal
    pub fn transmit(&mut self, payload: &str) -> String {
        if self.channel.state != ChannelState::Secure {
            return "BLOCKED: Channel insecure".to_string();
        }

        let signal = Signal {
            payload: payload.to_string(),
            integrity_hash: self.calculate_hash(payload),
        };
        
        self.channel.buffer.push(signal);
        format!("TX: '{}' [Hash: {:x}] sent.", payload, self.calculate_hash(payload))
    }

    /// Receive and verify a signal
    pub fn receive(&self) -> String {
        if let Some(signal) = self.channel.buffer.last() {
            let current_hash = self.calculate_hash(&signal.payload);
            if current_hash == signal.integrity_hash {
                format!("RX: '{}' [VERIFIED].", signal.payload)
            } else {
                "RX_ERROR: CORRUPTED SIGNAL.".to_string()
            }
        } else {
            "RX: Buffer Empty".to_string()
        }
    }

    /// Mock hashing function for integrity
    fn calculate_hash(&self, data: &str) -> u64 {
        let mut hash: u64 = 0xCBF29CE484222325;
        for byte in data.bytes() {
            hash ^= byte as u64;
            hash = hash.wrapping_mul(0x100000001b3);
        }
        hash
    }
}
