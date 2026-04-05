import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import { SVGDefs } from './SVGDefs';

describe('SVGDefs', () => {
  it('renders expected gradient and filter definition ids', () => {
    const { container } = render(
      <svg>
        <SVGDefs />
      </svg>
    );

    expect(container.querySelector('defs')).toBeInTheDocument();
    expect(container.querySelector('#moveGradient')).toBeInTheDocument();
    expect(container.querySelector('#currentNodeGradient')).toBeInTheDocument();
    expect(container.querySelector('#nodeFilter')).toBeInTheDocument();
    expect(container.querySelector('#currentNodeFilter')).toBeInTheDocument();
    expect(container.querySelector('#linkShadow')).toBeInTheDocument();
    expect(container.querySelector('#minimapGlow')).toBeInTheDocument();
  });
});
