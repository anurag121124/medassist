# Contributing to MedAssist

Thank you for your interest in contributing to MedAssist! This document provides guidelines and information for contributors.

## 🤝 Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before contributing.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- Supabase account (for database)
- OpenAI API key (for AI features)

### Setting Up Development Environment

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/yourusername/medassist.git
   cd medassist
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Fill in your environment variables
   ```

4. **Set up the database**
   - Create a Supabase project
   - Run the migration file in the SQL editor

5. **Start development server**
   ```bash
   npm run dev
   ```

## 📝 How to Contribute

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates.

**When submitting a bug report, please include:**

- **Clear title and description**
- **Steps to reproduce** the issue
- **Expected vs actual behavior**
- **Screenshots** (if applicable)
- **Environment details** (OS, browser, Node.js version)
- **Error messages** or console logs

### Suggesting Features

We welcome feature suggestions! Please:

1. **Check existing feature requests** to avoid duplicates
2. **Provide clear use cases** for the feature
3. **Explain the expected behavior**
4. **Consider the impact** on existing functionality

### Pull Requests

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the coding standards
   - Add tests for new functionality
   - Update documentation if needed

3. **Test your changes**
   ```bash
   npm run test
   npm run lint
   npm run type-check
   ```

4. **Commit your changes**
   ```bash
   git commit -m "feat: add amazing new feature"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Use a clear title and description
   - Reference any related issues
   - Include screenshots for UI changes

## 🎯 Development Guidelines

### Code Style

- **TypeScript**: Use TypeScript for all new code
- **ESLint**: Follow the existing ESLint configuration
- **Prettier**: Code formatting is handled by Prettier
- **Naming**: Use descriptive names for variables and functions

### Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(auth): add two-factor authentication
fix(api): resolve symptom analysis timeout issue
docs(readme): update installation instructions
```

### Testing

- **Unit Tests**: Write unit tests for utility functions
- **Integration Tests**: Test API endpoints and database interactions
- **E2E Tests**: Test critical user flows
- **Coverage**: Aim for >80% test coverage

```bash
# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test -- symptom-checker.test.ts
```

### Documentation

- **Code Comments**: Add comments for complex logic
- **API Documentation**: Document all API endpoints
- **README Updates**: Update README for new features
- **Type Definitions**: Maintain accurate TypeScript types

## 🏗️ Project Structure

```
medassist/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── (pages)/           # Page components
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── layout/           # Layout components
│   └── ui/               # UI components
├── lib/                  # Utility libraries
├── types/                # TypeScript type definitions
├── tests/                # Test files
└── docs/                 # Additional documentation
```

## 🔒 Security Guidelines

### Sensitive Data

- **Never commit** API keys, passwords, or secrets
- **Use environment variables** for configuration
- **Sanitize user inputs** to prevent XSS and injection attacks
- **Validate all data** on both client and server sides

### Medical Data

- **HIPAA Compliance**: Ensure all medical data handling follows HIPAA guidelines
- **Data Minimization**: Only collect necessary health information
- **Encryption**: All sensitive data must be encrypted
- **Access Controls**: Implement proper authorization checks

## 🧪 Testing Guidelines

### Writing Tests

1. **Test Structure**: Use the AAA pattern (Arrange, Act, Assert)
2. **Test Names**: Use descriptive test names
3. **Mock External Services**: Mock API calls and database operations
4. **Edge Cases**: Test error conditions and edge cases

### Example Test

```typescript
describe('Symptom Analysis API', () => {
  it('should return analysis for valid symptoms', async () => {
    // Arrange
    const symptoms = ['headache', 'fever'];
    const severity = 'moderate';
    
    // Act
    const result = await analyzeSymptoms(symptoms, severity);
    
    // Assert
    expect(result).toHaveProperty('possibleConditions');
    expect(result.urgencyLevel).toBeDefined();
  });
});
```

## 📋 Review Process

### Pull Request Review

All pull requests require:

1. **Code review** by at least one maintainer
2. **Passing tests** and linting checks
3. **Documentation updates** (if applicable)
4. **Security review** for sensitive changes

### Review Criteria

- **Functionality**: Does the code work as intended?
- **Code Quality**: Is the code clean and maintainable?
- **Performance**: Are there any performance implications?
- **Security**: Are there any security concerns?
- **Documentation**: Is the code properly documented?

## 🏷️ Release Process

### Versioning

We use [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Steps

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create release tag
4. Deploy to production
5. Announce release

## 🆘 Getting Help

### Communication Channels

- **GitHub Issues**: For bug reports and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Discord**: [Join our Discord server](https://discord.gg/medassist)
- **Email**: developers@medassist.com

### Resources

- **Documentation**: [Project Wiki](https://github.com/yourusername/medassist/wiki)
- **API Reference**: [API Documentation](docs/api.md)
- **Architecture Guide**: [Architecture Overview](docs/architecture.md)

## 🎉 Recognition

Contributors will be recognized in:

- **README.md**: Listed in the contributors section
- **Release Notes**: Mentioned in release announcements
- **Hall of Fame**: Featured on our website (with permission)

## 📄 License

By contributing to MedAssist, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to MedAssist! Together, we're building better healthcare accessibility for everyone. 🏥❤️