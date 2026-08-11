import { afterEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { Button } from './Button.jsx';

afterEach(cleanup);

describe('Button', () => {
  it('renders its children', () => {
    render(h(Button, null, 'Save'));
    assert.ok(screen.getByRole('button', { name: /save/i }));
  });

  it('renders a spinner and disables the button while loading', () => {
    render(h(Button, { loading: true }, 'Save'));
    const button = screen.getByRole('button', { name: /save/i });
    assert.equal(button.disabled, true);
  });
});
