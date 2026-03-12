
#[derive(Debug, Clone, PartialEq)]
pub enum Token {
    If,
    Then,
    Event(String),
    Vector(String),
    Unknown,
}

pub struct Syntax;

impl Syntax {
    /// Check if the token sequence follows the strict "IF Event THEN Vector" grammar
    pub fn validate(tokens: &[Token]) -> bool {
        if tokens.len() != 4 {
            return false;
        }
        matches!(
            (&tokens[0], &tokens[1], &tokens[2], &tokens[3]),
            (Token::If, Token::Event(_), Token::Then, Token::Vector(_))
        )
    }
}

pub struct Grammar {
    pub rules: Vec<String>,
}

impl Grammar {
    pub fn new() -> Self {
        Grammar {
            rules: vec!["IF <Event> THEN <Vector>".to_string()],
        }
    }
}

pub struct Language {
    pub name: String,
    pub version: String,
}

impl Language {
    pub fn omega_v1() -> Self {
        Language {
            name: "OMEGA-LANG".to_string(),
            version: "1.0".to_string(),
        }
    }
}
