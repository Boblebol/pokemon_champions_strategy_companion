import { describe, expect, it } from 'vitest';
import appPageArchive from '../docs/archive/legacy-app/AppPage.tsx.txt?raw';
import mobileNavArchive from '../docs/archive/legacy-app/components/MobileNav.tsx.txt?raw';
import projectCreditArchive from '../docs/archive/legacy-app/components/ProjectCreditPanel.tsx.txt?raw';
import pwaStatusTestArchive from '../docs/archive/legacy-app/components/PwaStatus.test.tsx.txt?raw';
import pwaStatusArchive from '../docs/archive/legacy-app/components/PwaStatus.tsx.txt?raw';
import docsPageArchive from '../docs/archive/legacy-app/DocsPage.tsx.txt?raw';
import landingPageArchive from '../docs/archive/legacy-app/LandingPage.tsx.txt?raw';

describe('legacy app archive', () => {
  it('keeps old non-mobile routes archived outside the active app source', () => {
    expect(appPageArchive).toContain('export default function AppPage');
    expect(landingPageArchive).toContain('export default function LandingPage');
    expect(docsPageArchive).toContain('export default function DocsPage');
    expect(mobileNavArchive).toContain('export function MobileNav');
    expect(pwaStatusArchive).toContain('export function PwaStatus');
    expect(pwaStatusTestArchive).toContain("describe('PwaStatus'");
    expect(projectCreditArchive).toContain('export function ProjectCreditPanel');
  });
});
