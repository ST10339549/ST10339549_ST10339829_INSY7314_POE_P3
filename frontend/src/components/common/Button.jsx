import React from 'react';
import PropTypes from 'prop-types';

export default function Button({ children, type = 'button', ...props }) {
  return (
    <button
      type={type}
      {...props}
      className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50 transition transform hover:scale-105"
    >
      {children}
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
};
