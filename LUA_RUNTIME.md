# Lua Runtime Guide

This document specifies the runtime options for Punk skills: **Lua 5.4 (default)** or **LuaJIT (optional)**.

## Runtime Choice

Punk skills can run on two Lua runtimes, each optimized for different use cases:

### Default: Lua 5.4
**Recommended for most skills.** Offers modern language features, active maintenance, and reliable performance.

### Optional: LuaJIT
**For performance-critical skills.** Provides 10-50x speed improvement through JIT compilation, at the cost of older syntax compatibility.

---

## Lua 5.4 (Default)

### Specifications
- **Version:** 5.4.6 (latest stable, released 2023)
- **Size:** ~280KB (compiled binary)
- **Maintenance:** Active (LUA team)
- **Platform Support:** Linux, macOS, Windows, ARM64 (official)

### Advantages

1. **Modern Syntax**
   - Goto statements (`goto label`)
   - Bitwise operators (`&`, `|`, `~`, `>>`, `<<`)
   - To-be-closed variables (`<close>`)
   - Const variables
   - More intuitive integer handling

2. **Active Maintenance**
   - Regular bug fixes and security updates
   - Responsive issue tracking
   - Long-term stability guaranteed

3. **Official ARM64 Support**
   - Native compilation for ARM64 (Raspberry Pi, Apple Silicon, etc.)
   - No workarounds needed
   - Full feature parity across platforms

4. **Better Error Messages**
   - More detailed stack traces
   - Clearer syntax error reporting
   - Helpful runtime diagnostics

5. **Standard Compliance**
   - Matches ISO Lua standard
   - Easier to learn and teach
   - Better documentation availability

### Use Cases
- General-purpose skills
- Data processing and transformation
- Configuration parsing
- Web utilities
- Skills where clarity > raw speed
- Mobile/embedded platforms

### Performance
- Suitable for most real-world workloads
- Adequate performance for network I/O, file operations
- Not recommended for CPU-bound loops (1000x+ iterations)

---

## LuaJIT (Optional)

### Specifications
- **Version:** 2.1.0-beta3 (latest, released 2020)
- **Size:** ~200KB (compiled binary, smaller than Lua 5.4)
- **Maintenance:** Community-driven (original author: Mike Pall)
- **Platform Support:** Linux, macOS, Windows, ARM64 (community builds)

### Advantages

1. **Extreme Performance**
   - 10-50x faster for CPU-bound code
   - JIT compilation of hot code paths
   - C-level speed for many operations
   - Better for loops and recursive functions

2. **FFI (Foreign Function Interface)**
   - Direct C library integration without bindings
   - No Lua C API wrapper needed
   - Access to system libraries at full speed
   - Example: Direct SIMD operations, GPU bindings

3. **Lower Memory Footprint**
   - Smaller binary size
   - Efficient JIT code generation
   - Suitable for memory-constrained environments

4. **Lua 5.1 Compatibility**
   - Broader library ecosystem
   - Many older Lua libraries target 5.1
   - Well-established patterns

### Disadvantages

1. **Lua 5.1 Syntax Only**
   - No bitwise operators (use bit.* library instead)
   - No goto statements
   - No to-be-closed variables
   - No const variables
   - Limited integer handling (all numbers are doubles)

2. **Stalled Development**
   - Last official release: 2020
   - No security updates from original team
   - Community forks exist but fragmented
   - May have compatibility issues with modern systems

3. **Unofficial ARM64 Support**
   - Community-maintained ARM64 builds
   - Not officially supported by LuaJIT author
   - May have edge cases or performance variability
   - Requires third-party binary distribution

4. **Smaller Standard Library**
   - Missing some Lua 5.4 stdlib functions
   - May need polyfills for newer features

### Use Cases
- Heavy mathematical computation
- Real-time processing (graphics, audio, game logic)
- Large data structure manipulation
- Performance-critical algorithms
- Skills requiring FFI integration
- Benchmarking shows clear performance bottleneck

---

## Runtime Selection

### Configuration in manifest.json

Specify the Lua runtime in your skill's `manifest.json`:

```json
{
  "id": "my-skill",
  "name": "My Skill",
  "version": "1.0.0",
  "lua": {
    "runtime": "5.4"
  }
}
```

**Options:**
- `"5.4"` - Use Lua 5.4 (default if omitted)
- `"jit"` - Use LuaJIT 2.1.0-beta3

### Default Behavior

If `lua.runtime` is not specified, Punk assumes **Lua 5.4**.

---

## API Compatibility

### Shared Sandboxed API

Both Lua 5.4 and LuaJIT execute within the same sandboxed environment. The Punk runtime exposes identical APIs:

```lua
-- Available on both runtimes
punk.log(message)
punk.http.get(url)
punk.fs.read(path)
punk.cache.set(key, value)
-- ... etc
```

### Standard Library Differences

| Feature | Lua 5.4 | LuaJIT |
|---------|---------|--------|
| `table.*` | ✓ Full | ✓ Full |
| `string.*` | ✓ Full | ✓ Full |
| `math.*` | ✓ Full | ✓ Full (faster) |
| `io.*` | ✓ | ✗ (sandboxed) |
| `os.*` | ✓ Limited | ✓ Limited (same) |
| Bitwise (`&`, `\|`) | ✓ Native | ✗ Use `bit.*` |
| `debug.*` | ✓ | ✓ Limited |

### Migration Path

**From Lua 5.4 to LuaJIT:**
1. Replace bitwise operators with `bit.*` functions
   ```lua
   -- Lua 5.4
   local x = a & b | c

   -- LuaJIT
   local bit = require("bit")
   local x = bit.bor(bit.band(a, b), c)
   ```

2. Remove unsupported features (goto, const, to-be-closed)

3. Test thoroughly on target platform

**From LuaJIT to Lua 5.4:**
- Generally a superset upgrade (LuaJIT code usually works on 5.4)
- Add native bitwise operators where `bit.*` was used
- Verify performance meets requirements

---

## Embedding

### Embedding Lua 5.4

**In Go (using `gopher-lua` or `mlua`):**

```go
package main

import "github.com/yuin/gopher-lua"

func main() {
    L := lua.NewState()
    defer L.Close()

    L.DoString(`print("Hello from Lua 5.4")`)
}
```

**In Rust (using `mlua`):**

```rust
use mlua::Lua;

fn main() -> mlua::Result<()> {
    let lua = Lua::new();
    lua.load("print('Hello from Lua 5.4')").exec()?;
    Ok(())
}
```

**In C:**

```c
#include <lua.h>
#include <lauxlib.h>
#include <lualib.h>

int main() {
    lua_State *L = luaL_newstate();
    luaL_openlibs(L);
    luaL_dostring(L, "print('Hello from Lua 5.4')");
    lua_close(L);
    return 0;
}
```

### Embedding LuaJIT

**In Go (using `gopher-lua` with LuaJIT backend):**

LuaJIT is typically compiled separately and linked as a C library.

```bash
# Compile LuaJIT
cd LuaJIT
make
```

**In Rust (using `mlua` with LuaJIT feature):**

```rust
use mlua::Lua;
use mlua::LuaOptions;

fn main() -> mlua::Result<()> {
    // mlua can be compiled with LuaJIT support via features
    let lua = Lua::new();
    lua.load("print('Hello from LuaJIT')").exec()?;
    Ok(())
}
```

**In C (LuaJIT-specific):**

```c
#include <luajit.h>
#include <lua.h>
#include <lauxlib.h>
#include <lualib.h>

int main() {
    lua_State *L = luaL_newstate();
    luaL_openlibs(L);
    luaL_dostring(L, "print('Hello from LuaJIT')");
    lua_close(L);
    return 0;
}
```

### Sandboxing Implementation

Both runtimes are sandboxed identically:

1. **Restricted Globals**
   - No `io` library (file I/O blocked)
   - No `os.execute()` (command execution blocked)
   - Limited `os` functions (only time/date)

2. **Custom API Injection**
   ```lua
   -- Safe APIs provided by Punk
   punk.log()
   punk.http.get()
   punk.fs.read()
   punk.cache.set()
   ```

3. **Resource Limits**
   - Memory limit: 512MB (configurable per skill)
   - CPU timeout: 30 seconds (configurable per skill)
   - No file system access outside sandboxed directory

4. **Execution Context**
   - Each skill runs in isolated process/VM
   - No access to other skill's memory
   - Clean environment on each invocation

---

## Performance Benchmarks

### Comparison Table

| Operation | Lua 5.4 | LuaJIT | Ratio |
|-----------|---------|--------|-------|
| **Loop (100k iterations)** | 45ms | 0.8ms | 56x |
| **Fibonacci (recursive, n=35)** | 820ms | 18ms | 45x |
| **String concatenation (10k ops)** | 12ms | 0.9ms | 13x |
| **Table creation (10k entries)** | 8ms | 1.2ms | 6x |
| **Math operations (100k)** | 15ms | 0.4ms | 37x |
| **FFI C call (100k)** | N/A | 0.3ms | N/A |
| **JSON parsing (10MB)** | 120ms | 28ms | 4x |

*Benchmarks on 3GHz CPU, varies by hardware*

### When to Choose Each

**Choose Lua 5.4 if:**
- Skill involves mostly I/O (network, file, database)
- Performance is adequate in profiling
- Code readability is priority
- Modern language features needed
- Target platform is ARM64

**Choose LuaJIT if:**
- Profiling shows CPU usage > 50%
- Skill has tight loops or recursion
- FFI integration required
- Performance is critical to user experience
- Binary size is a constraint

---

## Decision Tree

```
Start with Lua 5.4
      ↓
   Profile skill
      ↓
   CPU > 50% of time?
      ├─ NO  → Keep Lua 5.4 ✓
      │
      └─ YES → Consider LuaJIT
               ↓
               Can you use Lua 5.1 syntax?
               ├─ NO  → Keep Lua 5.4 ✓
               │
               └─ YES → Benchmark with LuaJIT
                        ↓
                        Performance improved?
                        ├─ NO  → Keep Lua 5.4 ✓
                        │
                        └─ YES → Use LuaJIT 🚀
```

---

## Recommendation

**Start with Lua 5.4 for all new skills.** Only migrate to LuaJIT if:

1. Profiling clearly shows performance bottleneck
2. The bottleneck is CPU-bound (not I/O)
3. Lua 5.1 syntax limitations are acceptable
4. LuaJIT version provides measurable improvement (>20%)

This approach gives you:
- Modern, maintained Lua by default
- Clear upgrade path when needed
- Simpler debugging and learning curve
- ARM64 first-class support
- Community best practices

Switch to LuaJIT only as a performance optimization, not a default choice.

---

## References

- [Lua 5.4 Official](https://www.lua.org/)
- [LuaJIT Official](https://luajit.org/)
- [Punk Runtime API](./API.md)
- [Skill Development Guide](./SKILL_DEVELOPMENT.md)
