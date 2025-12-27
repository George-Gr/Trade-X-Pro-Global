# File System Audit and Cleanup System

A comprehensive file system audit and cleanup tool for the Trade-X-Pro-Global project. This system provides advanced file analysis, duplicate detection, integrity checking, and secure deletion capabilities.

## 🚀 Features

### Core Functionality
- **File System Scanning**: Comprehensive analysis of all files in the project
- **Orphaned File Detection**: Identifies files with no references
- **Duplicate File Detection**: Finds duplicate files using content hashing and similarity analysis
- **Temporary File Cleanup**: Locates and removes .tmp, .temp, .cache files
- **Backup File Management**: Identifies .bak, .backup, ~ files
- **Log File Retention**: Enforces log retention policies
- **Installer/Executable Detection**: Identifies potential installer packages
- **Corrupted File Detection**: Checks file integrity and identifies problematic files
- **Test File Analysis**: Categorizes test files and development artifacts
- **Auto-generated File Detection**: Identifies files generated without user content

### Advanced Features
- **Preview Mode**: Review changes before applying them
- **Dry Run**: Simulate cleanup operations without making changes
- **Secure Deletion**: NIST-compliant secure file deletion
- **File Protection**: Prevents deletion of critical system files
- **Comprehensive Reporting**: Detailed reports with file sizes and timestamps
- **Reference Analysis**: Analyzes file dependencies and references

## 📁 File Structure

```
scripts/
├── file-system-audit.js          # Core audit engine
├── audit-cli.js                  # Interactive CLI interface
├── file-reference-analyzer.js    # Dependency analysis
├── advanced-duplicate-detector.js # Duplicate detection
├── file-integrity-checker.js     # File integrity validation
├── secure-deletion.js            # Secure file deletion
├── comprehensive-file-audit.js   # Master integration script
├── test-audit-system.js          # Test suite
├── fix-modules.js               # Module conversion utility
├── fix-all-imports.js           # Import syntax fixer
└── README.md                    # This documentation
```

## 🛠️ Installation

The system is self-contained and uses only Node.js built-in modules. No additional dependencies required.

## 📖 Usage

### Quick Start

1. **Basic File System Audit**:
   ```bash
   node scripts/file-system-audit.js --preview
   ```

2. **Interactive CLI Interface**:
   ```bash
   node scripts/audit-cli.js
   ```

3. **Comprehensive Audit**:
   ```bash
   node scripts/comprehensive-file-audit.js --preview --dry-run
   ```

### Advanced Usage

#### 1. File System Audit Engine

Basic usage:
```javascript
import FileSystemAudit from './file-system-audit.js';

const audit = new FileSystemAudit({
    rootPath: './project',
    preview: true,
    dryRun: false,
    logRetentionDays: 30,
    protectSystemFiles: true
});

const results = await audit.audit();
```

Options:
- `rootPath`: Directory to audit (default: current directory)
- `preview`: Show what would be deleted without actually deleting
- `dryRun`: Simulate all operations without making changes
- `logRetentionDays`: Days to keep log files (default: 30)
- `protectSystemFiles`: Protect critical files from deletion (default: true)

#### 2. Reference Analysis

```javascript
import FileReferenceAnalyzer from './file-reference-analyzer.js';

const analyzer = new FileReferenceAnalyzer('./project');
const results = await analyzer.analyze();

console.log(`Found ${results.orphanedFiles.length} orphaned files`);
```

#### 3. Duplicate Detection

```javascript
import AdvancedDuplicateDetector from './advanced-duplicate-detector.js';

const detector = new AdvancedDuplicateDetector({
    minFileSize: 1024,
    similarityThreshold: 0.95,
    maxFileSizeForHashing: 50 * 1024 * 1024
});

const results = await detector.findDuplicates('./project');
console.log(`Found ${results.duplicateGroups.length} duplicate groups`);
```

#### 4. Integrity Checking

```javascript
import FileIntegrityChecker from './file-integrity-checker.js';

const checker = new FileIntegrityChecker({
    checkCompression: true,
    checkEncoding: true,
    maxCorruptedFiles: 1000
});

const results = await checker.checkFileIntegrity('./project');
```

#### 5. Secure Deletion

```javascript
import SecureDeletion from './secure-deletion.js';

const deleter = new SecureDeletion({
    method: 'nist',
    passes: 3,
    verifyDeletion: true,
    backupMetadata: true
});

const results = await deleter.secureDelete(['file1.txt', 'file2.txt']);
```

Deletion Methods:
- `standard`: Overwrite with zeros, ones, and random data
- `nist`: NIST 800-88 compliant method
- `random`: Multiple passes with random data
- `custom`: Custom pattern based on file type

### CLI Options

#### File System Audit
```bash
node scripts/file-system-audit.js [path] [options]

Options:
  --preview           Preview mode (no actual deletions)
  --dry-run           Simulate all operations
  --log-retention=N   Log retention in days (default: 30)
  --no-protect        Disable system file protection
```

#### Comprehensive Audit
```bash
node scripts/comprehensive-file-audit.js [path] [options]

Options:
  --preview                    Preview mode
  --dry-run                    Simulate operations
  --no-ref-analysis            Disable reference analysis
  --no-duplicates              Disable duplicate detection
  --no-integrity               Disable integrity checking
  --no-secure-delete           Disable secure deletion
  --no-reports                 Disable report generation
  --output=directory           Output directory for reports
  --log-retention=N            Log retention in days
```

### Configuration Levels

The system provides four cleanup levels:

1. **Conservative**: Only removes obviously temporary files
   - Safe for all projects
   - Minimal risk of data loss
   - Protects all source code files

2. **Moderate**: Removes temp files, backups, and old logs
   - Good balance of cleanup and safety
   - Suitable for most projects
   - Protects source code and configuration

3. **Aggressive**: Removes all non-critical temporary files
   - Maximum cleanup
   - Review recommended before use
   - Protects only essential files

4. **Custom**: User-defined parameters
   - Full control over cleanup behavior
   - Custom retention policies
   - Configurable protection rules

## 📊 Reports and Output

### Generated Reports

The system generates several types of reports:

1. **JSON Reports**:
   - `FILE_SYSTEM_AUDIT_REPORT.json`
   - `COMPREHENSIVE_AUDIT_REPORT.json`
   - `SECURE_DELETION_REPORT.json`
   - `TEST_RESULTS.json`

2. **Readable Reports**:
   - `FILE_SYSTEM_AUDIT_READABLE.md`
   - `COMPREHENSIVE_AUDIT_READABLE.md`
   - `SECURE_DELETION_READABLE.md`

### Report Contents

Each report includes:
- **Executive Summary**: Total files, size, issues found
- **Category Breakdown**: Files by type and action needed
- **Duplicate Groups**: Groups of duplicate files with savings potential
- **Recommendations**: Prioritized actions with explanations
- **File Listings**: Detailed lists of files with sizes and dates

## 🛡️ Safety Features

### File Protection

The system includes comprehensive file protection:

**Protected Patterns**:
- Configuration files (package.json, tsconfig.json, etc.)
- Source code files (src/, components/, pages/, etc.)
- Documentation (README.md, docs/, etc.)
- Build outputs (dist/, build/, etc.)
- Dependencies (node_modules/, .git/, etc.)

**Protection Rules**:
- Pattern-based protection
- Extension-based protection
- Directory-based protection
- User-defined protection rules

### Safety Modes

1. **Preview Mode**: Shows what would be deleted without doing it
2. **Dry Run**: Simulates all operations with full logging
3. **Protected Mode**: Enhanced protection for critical files
4. **Backup Mode**: Creates metadata backups before deletion

## 🔍 Analysis Capabilities

### Orphaned File Detection

- **Reference Analysis**: Scans import/require statements
- **Link Detection**: Checks HTML href/src attributes
- **CSS URL Detection**: Finds referenced assets in CSS
- **Entry Point Recognition**: Identifies main application files

### Duplicate Detection

- **Content Hashing**: SHA-256 hashing for exact duplicates
- **Similarity Analysis**: Byte-level comparison for similar files
- **Size-based Grouping**: Efficient grouping by file size
- **Pattern Recognition**: Identifies duplicate patterns by type

### Integrity Checking

- **File Format Validation**: Checks file headers and structure
- **Syntax Validation**: Validates JSON, JS, CSS, HTML syntax
- **Encoding Verification**: Checks file encoding and character sets
- **Permission Analysis**: Identifies permission issues

## 🧪 Testing

### Running Tests

```bash
node scripts/test-audit-system.js
```

### Test Coverage

The test suite validates:
- File system scanning and categorization
- Reference analysis and orphaned file detection
- Duplicate detection and similarity analysis
- File integrity checking
- Secure deletion functionality
- Comprehensive audit integration

## 🔧 Troubleshooting

### Common Issues

1. **Module Loading Errors**:
   ```bash
   node scripts/fix-modules.js    # Convert to ES modules
   node scripts/fix-all-imports.js # Fix import syntax
   ```

2. **Permission Errors**:
   - Ensure read/write permissions on target directory
   - Run with appropriate user permissions

3. **Large Directory Performance**:
   - Use `--dry-run` first to test on large directories
   - Consider using `--preview` for initial analysis

4. **Memory Usage**:
   - Large files are processed in chunks
   - System includes memory leak prevention

### Debug Mode

Enable debug logging:
```bash
DEBUG=audit:* node scripts/comprehensive-file-audit.js --dry-run
```

## 📈 Performance Considerations

### Optimization Features

- **Chunked Processing**: Large files processed in chunks
- **Memory Management**: Automatic cleanup of large data structures
- **Parallel Processing**: Concurrent file analysis where possible
- **Caching**: Intelligent caching of file hashes and metadata

### Performance Monitoring

The system includes built-in performance monitoring:
- Scan duration tracking
- Memory usage reporting
- Processing rate calculation
- Bottleneck identification

## 🔒 Security

### Secure Deletion

The secure deletion feature implements:
- **NIST 800-88 Compliance**: Industry-standard secure deletion
- **Multiple Pass Overwrite**: Configurable number of overwrite passes
- **Verification**: Post-deletion verification
- **Metadata Handling**: Secure handling of file metadata

### Data Protection

- **No External Dependencies**: Self-contained system
- **Local Processing**: All analysis performed locally
- **Audit Logging**: Complete audit trail of all operations
- **Reversible Operations**: Metadata backup for potential restoration

## 🤝 Contributing

To extend the system:

1. **Add New File Types**: Extend file type handlers
2. **Custom Patterns**: Add protection and detection patterns
3. **New Analysis**: Implement additional analysis methods
4. **Reporting**: Enhance report generation and formatting

## 📝 License

This file system audit system is part of the Trade-X-Pro-Global project and follows the same licensing terms.

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review generated reports for detailed information
3. Run tests to validate system functionality
4. Use `--dry-run` and `--preview` modes for safe testing

---

**⚠️ Important**: Always review reports and use `--preview` mode before performing actual cleanup operations. The system is designed to be safe, but backup important data before running cleanup operations.