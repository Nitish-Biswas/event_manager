module.exports = ({ addUtilities, theme }) => {
  addUtilities({
    '.ring-offset-background': {
      '--tw-ring-offset-color': 'var(--tw-bg-color, var(--tw-bg-opacity, 1) #fff)',
    },
    '.ring-ring': {
      '--tw-ring-color': theme('colors.primary.600', '#3b82f6'),
    },
  })
}
