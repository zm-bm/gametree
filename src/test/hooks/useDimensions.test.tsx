import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useDimensions } from "../../hooks/useDimensions";
import { useEffect } from "react";

describe('useDimensions', () => {
  const TestComponent = () => {
    const [ref,] = useDimensions();

    useEffect(() => {
      if (ref.current) {
        Object.defineProperty(ref.current, 'offsetWidth', { value: 100 });
        Object.defineProperty(ref.current, 'offsetHeight', { value: 200 });
      }
    }, [ref]);

    return <div ref={ref}></div>;
  };

  it('returns correct dimensions', () => {
    const { container } = render(<TestComponent />);
    const div = container.querySelector('div');

    expect(div?.offsetWidth).toBe(100);
    expect(div?.offsetHeight).toBe(200);
  });
});
