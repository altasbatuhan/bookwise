// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Scans all JS and JSX files in src folder
  ],
  theme: {
    extend: {
      colors: {
        "bookwise-blue": "#0F172A",
        "bookwise-gray": "#1E293B",
        "bookwise-blue2": "#38BDF8",
        "bookwise-yellow": "#f0f465",
      },
    },
  },
  plugins: [],
};
