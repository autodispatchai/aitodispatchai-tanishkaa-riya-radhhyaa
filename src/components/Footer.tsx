import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-neutral-100 border-t border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Company */}
          <div>
            <h3 className="font-semibold text-neutral-900 mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li>
                <Link href="/about-us" className="hover:text-purple-700 transition-colors">About Us</Link>
              </li>
              <li>
                <a href="mailto:info@autodispatchai.com" className="hover:text-purple-700 transition-colors">Contact</a>
              </li>
            </ul>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold text-neutral-900 mb-4">Product</h3>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li>
                <a href="#features" className="hover:text-purple-700 transition-colors">Features</a>
              </li>
              <li>
                <Link href="/choose-plan" className="hover:text-purple-700 transition-colors">Pricing</Link>
              </li>
              <li>
                <Link href="/security" className="hover:text-purple-700 transition-colors">Security</Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-neutral-900 mb-4">Resources</h3>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li>
                <Link href="/demo" className="hover:text-purple-700 transition-colors">Demo</Link>
              </li>
              <li>
                <a href="#roi" className="hover:text-purple-700 transition-colors">ROI Calculator</a>
              </li>
              <li>
                <a href="#faq" className="hover:text-purple-700 transition-colors">FAQ</a>
              </li>
              <li>
                <Link href="/blog" className="hover:text-purple-700 transition-colors">Blog</Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-neutral-900 mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li>
                <Link href="/privacy" className="hover:text-purple-700 transition-colors">Privacy</Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-purple-700 transition-colors">Terms</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-neutral-600">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} AutoDispatchAI Inc.</span>
            <span className="flex items-center gap-1.5">
              <span className="text-lg">🇨🇦</span>
              <span className="font-medium">Proudly Canadian</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a href="mailto:info@autodispatchai.com" className="hover:text-purple-700 transition-colors">
              info@autodispatchai.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

