# Hide Env for Visual Studio Code

**Quickly and automatically hide sensitive information in your files. Perfect for screen sharing, live coding, and protecting your secrets.**

`Hide Env` is a Visual Studio Code extension designed to prevent accidental exposure of sensitive data, such as API keys, environment variables, and other secrets. It works by visually obscuring the values in your files that match predefined patterns, replacing them with `******`.

This is especially useful during screen sharing sessions, video recordings, or live-coding presentations, ensuring your confidential information remains private.

## Demo


![Demo GIF of Hide Env in action](images/demo.gif)


## Features

- **Automatic Hiding:** Automatically hides sensitive values in files that match your rules.
- **`.gitignore`-Style Rules:** Uses a `.hide` file in your project root that follows familiar `.gitignore` syntax.
- **Flexible Separators:** Works with both `=` and`:` as key-value separators, making it compatible with `.env` files, JSON, YAML, and more.
- **Real-time Updates:** The extension reacts instantly to changes in your `.hide` file. Add or remove a rule, and see the effect immediately without reloading.
- **Simple and Lightweight:** No complex configuration. Just create a `.hide` file and you're ready to go.

## How to Use

1.  **Install:** Install the `Hide Env` extension from the VS Code Marketplace.
2.  **Create a `.hide` file:** In the root directory of your project, create a file named `.hide`.
3.  **Define Your Rules:** Add file patterns to the `.hide` file, just like you would with a `.gitignore` file.

    **Example `.hide` file:**
    ```
    # Hide the root .env file
    .env

    # Hide any file named secrets.json
    secrets.json

    # Hide all files ending with .prod.env in any subdirectory
    **/*.prod.env
    ```
4.  **See the Magic:** Open a file that matches one of your rules (e.g., `.env`) containing `API_KEY=YOUR_SECRET_VALUE`. The extension will automatically hide the value: `API_KEY=******`.

To temporarily see the real value, you can comment out the corresponding rule in your `.hide` file (by adding a `#` at the beginning of the line) and save the file. The value will reappear instantly.

## Extension Settings

This extension does not add any VS Code settings. Configuration is managed entirely through the `.hide` file.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.