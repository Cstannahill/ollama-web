import { SecurityLayer } from '../../../src/lib/securityLayer';

describe('SecurityLayer', () => {
  it('strips script tags', () => {
    const dirty = '<img src=x onerror=alert(1) /><script>alert(1)</script>';
    const clean = SecurityLayer.sanitize(dirty);
    expect(clean).not.toMatch(/<script>/);
    expect(clean).not.toMatch(/onerror/);
  });
});
