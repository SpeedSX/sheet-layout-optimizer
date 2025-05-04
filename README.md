# Sheet Layout Optimizer

A web application for typesetting and printing companies that optimizes the layout of multiple product types on printing sheets.

## Features

- **Sheet Configuration**: Define custom sheet dimensions in millimeters
- **Multi-Product Support**: Add multiple product types with different dimensions and quantities
- **Optimized Layout**: Arranges products efficiently using an advanced 2D bin packing algorithm
- **Ratio Maintenance**: Preserves the original ratio between different product quantities
- **Identical Sheets**: Generates consistent layouts across all sheets for easier printing
- **Visual Preview**: Displays the optimized layout with intuitive visualization
- **Quantity Calculation**: Shows how many sheets are needed and the total items produced

## Usage

1. **Configure Sheet Size**:
   - Set the width and height of your printing sheet in millimeters

2. **Add Products**:
   - Enter product name, dimensions (width and height), and quantity
   - Add as many different product types as needed

3. **Optimize Layout**:
   - Click the "Optimize Layout" button to generate the optimal arrangement
   - View the visual representation of the layout and production statistics

4. **Review Results**:
   - Check the total number of sheets required
   - Verify the utilization rate (sheet area usage efficiency)
   - Review how many items of each product will be placed on each sheet
   - Confirm the total quantities that will be produced

## Technical Details

Built with modern web technologies:
- React 18+
- TypeScript
- Vite
- React-Konva for canvas visualization

The layout optimization algorithm uses:
- Binary search approach for maximizing items per sheet
- Edge-based placement scoring for efficient packing
- Proportional distribution to maintain product ratios

## Getting Started

### Prerequisites
- Node.js 16.0 or higher
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Deployment

The built application (found in the `dist` directory after running `npm run build`) can be deployed to any static hosting service like Netlify, Vercel, or GitHub Pages.

## License

MIT
