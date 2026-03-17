# gt15_structure_charge_competition

- scenario: standalone structure charge competition
- setup: standalone deterministic subprocess capture of two OP_PLUG publications
  hitting the same cell in both low->high and high->low orderings
- duration: 4 execute_atom calls + 1 structure tick / subprocess capture
- daemonEnabled: false
- runtime_mode: standalone-structure-charge-competition-capture
- workers: 1
- strict: true
- hash: 028319ea4fafa984573566120d552d3706b7ab2df57c53458883665f181f7b01

## Structure charge competition capture

- low_then_high_charge_intent=220
- low_then_high_resolved_charge=210
- high_then_low_charge_intent=220
- high_then_low_resolved_charge=210
