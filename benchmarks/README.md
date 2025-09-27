# Ecstatic Performance Benchmarks

This directory contains performance benchmarks for the Ecstatic ECS library. These benchmarks help track performance characteristics and identify potential bottlenecks in core ECS operations.

## Available Benchmarks

### Entity Operations (`entity-operations.bench.ts`)

Tests basic entity lifecycle operations:

- Entity creation (with and without components)
- Component addition/removal
- Component access and queries
- Bulk operations (1000 entities/components)

### System Operations (`system-operations.bench.ts`)

Tests system performance and iteration:

- System registration and execution
- Single system with varying entity counts (100-1000 entities)
- Multiple systems running simultaneously
- Complex component queries in systems

### Query Operations (`query-operations.bench.ts`)

Tests world-level query performance:

- `locate()` - Find first entity with component
- `grab()` / `grabBy()` / `grabAll()` - Entity and component retrieval
- `find()` / `findAll()` - Predicate-based queries
- Complex multi-component queries

### Stress Tests (`stress-test.bench.ts`)

Tests performance under heavy load:

- Large worlds (10,000 entities)
- Entity lifecycle simulation (create/use/destroy cycles)
- Component hot-swapping
- Complex multi-system interactions
- Memory pressure scenarios

## Running Benchmarks

### Basic Usage

```bash
# Run all benchmarks
npm run bench

# Run benchmarks with UI
npm run bench:ui

# Run specific benchmark file
npx vitest bench entity-operations.bench.ts

# Run benchmarks and save results to JSON
npm run bench:json

# Compare current results with saved baseline
npm run bench:compare
```

### Command Line Options

Vitest bench supports standard Vitest options:

- `--run` - Run once and exit (instead of watch mode)
- `--reporter=verbose` - Detailed output with statistics
- `--outputJson <file>` - Save results to JSON file
- `--compare <file>` - Compare against saved results

## Interpreting Results

Each benchmark reports several key metrics:

- **hz**: Operations per second (higher is better)
- **min/max**: Minimum/maximum execution time
- **mean**: Average execution time
- **p75/p99/p995/p999**: Percentile execution times
- **rme**: Relative margin of error
- **samples**: Number of benchmark iterations

### Key Performance Indicators

**Entity Operations:**

- Entity creation should be < 1μs (microsecond)
- Component operations should be < 1μs
- Bulk operations scale roughly linearly with entity count

**System Operations:**

- System iteration scales with entity count
- Multiple systems add overhead but should be minimal
- Complex queries impact performance based on component combinations

**Query Operations:**

- Simple queries (`locate`, `grab`) should be very fast (< 1μs)
- Predicate-based queries (`find`, `findAll`) scale with entity count
- Complex multi-component queries are more expensive

## Benchmark Results Storage

Benchmark results can be saved to track performance over time:

```bash
# Save current results as baseline
npm run bench:json

# This creates benchmark-results.json
# Future runs can compare against this baseline
npm run bench:compare
```

## Performance Guidelines

### Expected Performance Ranges

**Micro-benchmarks (single operations):**

- Entity creation: 500,000 - 2,000,000 ops/sec
- Component access: 1,000,000 - 3,000,000 ops/sec
- Simple queries: 1,000,000 - 5,000,000 ops/sec

**Macro-benchmarks (bulk operations):**

- 1000 entities: 1000 - 5000 ops/sec
- System iteration scales with entity count and system complexity

### Performance Regression Detection

Use the comparison feature to detect performance regressions:

```bash
# After making changes, compare against baseline
npm run bench:compare

# Look for significant changes in:
# - Mean execution time increases > 10%
# - Operations/second decreases > 10%
# - Percentile increases indicating outliers
```

## Benchmark Maintenance

### Adding New Benchmarks

1. Create new `.bench.ts` file in this directory
2. Follow the existing pattern using Vitest's `bench()` function
3. Include proper cleanup in benchmarks to avoid memory leaks
4. Add timeout for long-running benchmarks: `{ timeout: 30000 }`

### Benchmark Best Practices

1. **Cleanup**: Always destroy entities after benchmarks
2. **Isolation**: Each benchmark should be independent
3. **Realistic Data**: Use component combinations that reflect actual usage
4. **Timeout**: Set appropriate timeouts for long-running benchmarks
5. **Memory**: Be mindful of memory usage in large benchmarks

### Example Benchmark Structure

```typescript
import { bench, describe } from 'vitest';
import { World } from '../src/index';

describe('My Benchmark Suite', () => {
  bench('operation name', () => {
    const world = new World();
    // ... benchmark code ...
    // Cleanup
    world.entities.forEach(entity => entity.destroy());
  });
});
```

## Troubleshooting

### Common Issues

**Memory Leaks**: Ensure all entities are destroyed after benchmarks
**Slow Benchmarks**: Check for inefficient operations or missing cleanup
**Inconsistent Results**: Run benchmarks multiple times, check for GC interference

### Performance Analysis

Use the benchmark results to identify bottlenecks:

- Focus on operations that will be called frequently in games
- Profile system iteration performance
- Monitor memory usage in stress tests

## Integration with CI/CD

Consider integrating benchmarks into your CI pipeline:

```yaml
# Example GitHub Actions step
- name: Run Performance Benchmarks
  run: npm run bench:json

- name: Compare Performance
  run: npm run bench:compare || echo "Performance regression detected"
```
