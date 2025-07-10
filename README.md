# ObsVMixer

It's a simple React application that connects to OBS (Open Broadcaster Software) to recreate the comportment of the vMix software, allowing users to have an "equivalent" multiview functionality.

## Features
- Connect to OBS WebSocket
- Display scenes and sources
- Switch scenes
- Multicam support
- Debug panel for OBS WebSocket messages

## Installation

### Setup on OBS
To use this application, you need to have the OBS WebSocket activated. You will also need to accept some formalities in the scene names to ensure compatibility with the application.

The following scene names are required:
- `CAMSELECT X` where `X` is whatever number you want (e.g., `CAMSELECT 1`, `CAMSELECT HELLO`, etc.)
    - The `CAMSELECT` scene is used to select the camera for the multiview.
- `CAM X` where `X` is whatever number you want (e.g., `CAM 1`, `CAM SCENE`, etc.)
    - The `CAM` scene is used to display the camera in the multiview.
- `F X` where `X` is whatever number you want (e.g., `F 1`, `F SCENE`, etc.)
    - The `F` scene is used to display the full screen of the camera in the multiview.

### Usage on website (you can also use the website in a OBS Dock)

1. Go on : https://wiibleyde.github.io/ObsVMixer/
2. Enter your OBS WebSocket host, port and password
3. Click on "Connect"
4. Enjoy the multicam manager !

## Development

### Prerequisites
- Node.js (v22 or higher)
- npm (v9 or higher)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Wiibleyde/ObsVMixer.git
   ```
2. Navigate to the project directory:
   ```bash
   cd ObsVMixer
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open your browser and go to `http://localhost:5173` to view the application.

## Contributing
Contributions are welcome! Please feel free to submit a pull request or open an issue if you find a bug or have a feature request.

## License
This project is licensed under the GNU General Public License v3.0. See the [LICENSE](LICENSE) file for details.

## Acknowledgements
- Thanks to the OBS WebSocket team for their work on the OBS WebSocket plugin.
- Thanks to the React community for their contributions and support.

## Contact
If you have any questions or suggestions, feel free to reach out to me on GitHub or via email at [nathan@bonnell.fr](mailto:nathan@bonnell.fr).

