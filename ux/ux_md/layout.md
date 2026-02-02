# Oxford Nexus - Layout & Styling

## Design System
The application uses a custom design system built on top of Tailwind CSS variables. All colors are defined as HSL values in `src/index.css`.

### Color Palette
- **Primary (Oxford Navy)**: `hsl(222 47% 11%)` - Used for headers, primary text, Business Banking.
- **Accent (Oxford Gold)**: `hsl(43 74% 49%)` - Used for highlights, OCF team, KPIs.
- **Secondary**: `hsl(215 28% 17%)` - Used for Personal Banking, backgrounds.
- **Semantic Colors**:
    - **Success**: Green `hsl(142 71% 45%)` (Increases, positive growth).
    - **Destructive**: Red `hsl(0 84% 60%)` (Decreases, attrition).
    - **Muted**: Greys for borders and secondary text.

### Typography
- Standard sans-serif font stack.
- Heavy use of `text-muted-foreground` for labels and secondary information.
- `text-2xl font-bold` used for section headers.

## Global Styles (`index.css`)
- Defines CSS variables for Light and Dark modes.
- `radius` variable controls component rounded corners (0.75rem).
- Custom utility classes for `sidebar` and `chart` colors.

## Tailwind Configuration (`tailwind.config.ts`)
- **DarkMode**: Class-based.
- **Container**: Centered with 2rem padding.
- **Extended Theme**:
    - Custom colors map to the CSS variables (e.g., `oxford.navy`, `oxford.gold`).
    - Custom keyframes for accordion animations (`accordion-down`, `accordion-up`).
    - Breakpoints: standard Tailwind + `2xl: 1400px`.
