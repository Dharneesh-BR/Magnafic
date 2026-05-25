# Sanity Data Fix Scripts

## fix-usecases-list.mjs

This script fixes invalid data in the `useCasesList` field of capabilities documents. It removes any items that are not valid objects with a `title` field.

### Prerequisites

You need a Sanity API token with write permissions to run this script.

### Getting a Sanity API Token

1. Go to [https://www.sanity.io/manage](https://www.sanity.io/manage)
2. Select your project (Mind Magna)
3. Navigate to the "API" tab
4. Click "Add API token"
5. Give it a name (e.g., "Data Fix Script")
6. Select the "Production" dataset
7. Grant "Editor" permissions
8. Copy the generated token

### Running the Script

1. Set the environment variable:
   ```bash
   # On Windows (PowerShell)
   $env:SANITY_API_TOKEN="your-token-here"
   
   # On Windows (Command Prompt)
   set SANITY_API_TOKEN=your-token-here
   
   # On macOS/Linux
   export SANITY_API_TOKEN="your-token-here"
   ```

2. Run the script:
   ```bash
   npm run fix:usecases
   ```

### What the Script Does

- Fetches all capabilities that have a `useCasesList` field
- Filters out any items that are not valid objects (e.g., strings, numbers, null)
- Updates the document with the cleaned list
- Reports how many documents were fixed and how many invalid items were removed

### Schema Validation

The capabilities schema now includes custom validation to prevent this issue in the future. The validation ensures that all items in `useCasesList` are objects with a `title` field.
