import React from 'react';

interface LinkDisplayProps {
  links: string[];
}

interface FormattedUrl {
  displayText: string;
  fullUrl: string;
  label?: string;
}

const LinkDisplay: React.FC<LinkDisplayProps> = ({ links }) => {
  if (!links || links.length === 0) return null;

  const formatUrl = (linkText: string): FormattedUrl => {
    // Find the first occurrence of "http://" or "https://"
    const urlMatch = linkText.match(/(https?:\/\/\S+)/i);
    if (!urlMatch) {
      return {
        displayText: linkText,
        fullUrl: linkText.startsWith('http') ? linkText : `https://${linkText}`
      };
    }

    const url = urlMatch[1];
    // Get any text before the URL as the label
    const label = linkText.substring(0, linkText.indexOf(url)).trim();
    // Remove any trailing colons or spaces from the label
    const cleanLabel = label.replace(/[:]\s*$/, '');

    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.replace('www.', '');
      const path = urlObj.pathname;
      
      let displayText = domain;
      if (path && path !== '/') {
        const pathParts = path.split('/').filter(Boolean);
        if (pathParts.length > 0) {
          displayText += ` / ${pathParts[0]}`;
        }
      }
      
      return {
        displayText,
        fullUrl: url,
        label: cleanLabel || undefined
      };
    } catch (error) {
      console.log(error);
      return {
        displayText: url,
        fullUrl: url,
        label: cleanLabel || undefined
      };
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Links of Interest</h2>
      <ul className="space-y-2">
        {links.map((link: string, index: number) => {
          const { displayText, fullUrl, label } = formatUrl(link);
          return (
            <li key={index} className="flex items-center">
              {label && (
                <span className="text-muted-foreground mr-2">{label}:</span>
              )}
              <a
                href={fullUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                {displayText}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default LinkDisplay;