import { Link } from "wouter";
import { Github, Instagram, Twitter, Facebook } from "lucide-react";

export default function AppFooter() {
  const year = new Date().getFullYear();
  
  return (
    <footer className="border-t bg-gray-50 text-sm">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h4 className="font-semibold text-lg mb-4">IWB Enterprise Portal</h4>
            <p className="text-gray-600 mb-4">
              Comprehensive business management system with robust authentication and dynamic access control.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-primary">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-primary">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-primary">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-primary">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/">
                  <div className="text-gray-600 hover:text-primary cursor-pointer">Dashboard</div>
                </Link>
              </li>
              <li>
                <Link href="/products">
                  <div className="text-gray-600 hover:text-primary cursor-pointer">Products</div>
                </Link>
              </li>
              <li>
                <Link href="/income">
                  <div className="text-gray-600 hover:text-primary cursor-pointer">Income</div>
                </Link>
              </li>
              <li>
                <Link href="/queries">
                  <div className="text-gray-600 hover:text-primary cursor-pointer">Queries</div>
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-600 hover:text-primary">Documentation</a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary">API Reference</a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary">Support</a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary">Tutorials</a>
              </li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <address className="not-italic text-gray-600">
              <p>123 Business Avenue</p>
              <p>Enterprise District</p>
              <p>New York, NY 10001</p>
              <p className="mt-2">Email: support@iwbportal.com</p>
              <p>Phone: (555) 123-4567</p>
            </address>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600">
            © {year} IWB Enterprise Portal. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-gray-600 hover:text-primary">Privacy Policy</a>
            <a href="#" className="text-gray-600 hover:text-primary">Terms of Service</a>
            <a href="#" className="text-gray-600 hover:text-primary">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}