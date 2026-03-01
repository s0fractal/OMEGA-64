(module
 (type $0 (func (result i32)))
 (import "env" "memory" (memory $0 1))
 (global $assembly/index/IN_PTR i32 (i32.const 0))
 (global $assembly/index/OUT_PTR i32 (i32.const 64))
 (export "IN_PTR" (global $assembly/index/IN_PTR))
 (export "OUT_PTR" (global $assembly/index/OUT_PTR))
 (export "execute_atom" (func $assembly/index/execute_atom))
 (export "memory" (memory $0))
 (func $assembly/index/execute_atom (result i32)
  (local $0 i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 f32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  i32.const 0
  i32.load8_u
  local.set $5
  i32.const 1
  i32.load8_u
  local.set $6
  i32.const 2
  i32.load8_u
  local.set $1
  i32.const 3
  i32.load8_u
  local.set $2
  i32.const 4
  i32.load8_u
  local.tee $7
  i32.const 1
  i32.and
  local.set $4
  i32.const 64
  f32.const -0.05000000074505806
  f32.const 0
  local.get $7
  select
  local.tee $3
  f32.store
  i32.const 68
  f32.const 0
  f32.store
  i32.const 72
  i32.const 0
  i32.store8
  i32.const 76
  f32.const 0
  f32.store
  i32.const 80
  f32.const 0
  f32.store
  loop $for-loop|0
   local.get $0
   i32.const 32
   i32.lt_u
   if
    local.get $0
    local.get $0
    i32.load8_u offset=5
    i32.store8 offset=84
    local.get $0
    i32.const 1
    i32.add
    local.set $0
    br $for-loop|0
   end
  end
  local.get $5
  i32.const 16
  i32.eq
  if
   i32.const 72
   i32.const 1
   i32.store8
   i32.const 76
   local.get $6
   f32.convert_i32_u
   f32.const -128
   f32.add
   f32.const 10
   f32.div
   f32.store
   i32.const 80
   local.get $1
   f32.convert_i32_u
   f32.const -128
   f32.add
   f32.const 10
   f32.div
   f32.store
   i32.const 64
   local.get $3
   local.get $3
   f32.const -1
   f32.add
   local.get $4
   select
   f32.store
   i32.const 1
   return
  end
  local.get $5
  i32.const 64
  i32.eq
  if
   local.get $6
   i32.const 7
   i32.and
   local.get $1
   i32.const 7
   i32.and
   i32.load8_u offset=86
   local.get $2
   i32.const 7
   i32.and
   i32.load8_u offset=86
   i32.add
   i32.store8 offset=86
   i32.const 1
   return
  end
  local.get $5
  i32.const 65
  i32.eq
  if
   local.get $6
   i32.const 7
   i32.and
   local.get $1
   i32.const 7
   i32.and
   i32.load8_u offset=86
   local.get $2
   i32.const 7
   i32.and
   i32.load8_u offset=86
   i32.sub
   i32.store8 offset=86
   i32.const 1
   return
  end
  local.get $5
  i32.const 80
  i32.eq
  if
   i32.const 102
   i32.load8_u
   i32.const 7
   i32.and
   local.set $0
   local.get $1
   if
    local.get $1
    i32.const 1
    i32.eq
    if
     local.get $6
     i32.const 7
     i32.and
     local.get $0
     i32.load8_u offset=94
     i32.store8 offset=86
    end
   else
    local.get $6
    i32.const 7
    i32.and
    local.get $2
    i32.const 7
    i32.and
    i32.load8_u offset=86
    i32.store8 offset=86
   end
   i32.const 1
   return
  end
  local.get $5
  i32.const 81
  i32.eq
  if
   local.get $6
   i32.const 1
   i32.eq
   if
    i32.const 102
    i32.load8_u
    i32.const 7
    i32.and
    local.tee $0
    local.get $1
    i32.const 7
    i32.and
    i32.load8_u offset=86
    i32.store8 offset=94
    i32.const 102
    local.get $0
    i32.const 1
    i32.add
    i32.const 7
    i32.and
    i32.store8
   end
   i32.const 1
   return
  end
  i32.const 0
 )
)
