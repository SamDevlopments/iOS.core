# Photo Selection & Cutout Tool

A modern iOS-inspired web application for precise image selection and cutout creation with advanced customization options.

## Features

### Core Functionality
- **Manual Selection Tool**: Draw precise selections on uploaded images
- **Cutout Creation**: Create exact cutouts from selections with 100% accuracy
- **Drag & Drop**: Move cutouts freely around the canvas
- **Resize**: Resize cutouts with corner handles
- **Long Press Context Menus**: iOS-style context menus for quick actions

### Selection Customization
- **Border Types**: 
  - None
  - Dashed (classic marching ants)
  - Broken (dotted with fast animation)
  - Phantom (subtle pulsing white)
  - Dash-dot (alternating pattern)
- **Handle Types**:
  - None
  - Rectangle (square handles)
  - Circle (round handles)
- **Accent Color**: Full color customization with preset palette and custom color picker

### UI Design
- **iOS Glassmorphism**: Beautiful frosted glass effects throughout
- **Smooth Animations**: iOS-style transitions and micro-interactions
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Collapsible Sections**: Organized options menu with expandable sections

### Context Menus
- **Selection Actions**: Duplicate, Delete, Close options
- **Cutout Management**: Full control over created cutouts
- **Smart Positioning**: Menus appear at touch/click location
- **Glass Blur Background**: Beautiful blur effects when menus are active

## How to Use

1. **Upload an Image**: Click the upload card or drag & drop an image
2. **Create Selection**: Click and drag on the image to create a selection
3. **Create Cutout**: Release to automatically create a cutout from the selection
4. **Customize**: Access Options menu to change border styles, handle types, and colors
5. **Manage Cutouts**: Long press on cutouts for duplicate/delete options
6. **Interact**: Drag cutouts to move, use handles to resize

## Technical Features

### Advanced Selection System
- **100% Accurate Cutouts**: Selection area matches cutout exactly
- **Real-time Preview**: Live selection overlay with customizable styles
- **Multiple Border Animations**: Each border type has unique animation
- **Handle Customization**: Switch between square and round handles

### Glassmorphism Design
- **Backdrop Blur Effects**: iOS-style blur when menus are active
- **Proper Stacking Context**: Cutouts and menus hover above blur
- **Smooth Transitions**: Cubic-bezier animations for natural movement
- **Component Isolation**: Prevents blur from affecting interactive elements

### Performance Optimizations
- **Efficient Canvas Operations**: Optimized cutout creation
- **Smart Event Handling**: Proper touch and mouse event management
- **Memory Management**: Clean cleanup of cutouts and selections
- **Responsive Interactions**: Smooth drag and resize operations

## File Structure

```
├── index.html          # Main application structure
├── style.css           # Complete styling with glassmorphism effects
├── script.js           # Core functionality and interactions
└── README.md           # This documentation
```

## Browser Compatibility

- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **Mobile Support**: iOS Safari, Chrome Mobile
- **Web Features**: Uses backdrop-filter, CSS transforms, and modern APIs

## Dependencies

- **@imgly/background-removal**: For AI background removal (optional)
- **No Framework**: Pure vanilla JavaScript implementation

## Key Technologies

- **HTML5 Canvas**: For precise cutout creation
- **CSS3 Features**: backdrop-filter, transforms, animations
- **Vanilla JavaScript**: No external framework dependencies
- **Touch Events**: Full mobile touch support
- **File API**: Image upload and processing

## Development Notes

### Selection Accuracy
The selection system uses precise coordinate calculations to ensure cutouts match the selection area exactly. This involves:
- Display vs natural image size ratio calculations
- Precise canvas cropping operations
- Consistent coordinate system mapping

### Glassmorphism Implementation
The blur effects are implemented using:
- CSS backdrop-filter for menu backgrounds
- Proper z-index stacking for layer separation
- Transform properties to create new rendering contexts
- Isolation properties to prevent blur interference

### Mobile Optimization
Touch interactions are optimized with:
- Passive event listeners for better performance
- Touch-specific coordinate calculations
- Proper touch event handling
- Responsive menu positioning

## License

This project is a demonstration of modern web capabilities and UI design patterns.
