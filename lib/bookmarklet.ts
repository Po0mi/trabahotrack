export function generateBookmarklet(boardUrl: string): string {
  const script = [
    "(function(){",
    "var t=document.title;",
    "var u=window.location.href;",
    "var co='',ro='';",
    "var m=t.match(/^(.+?)\\s+at\\s+(.+?)\\s*\\|/i);",
    "if(m){ro=m[1].trim();co=m[2].trim();}",
    "if(!co){m=t.match(/^(.+?)\\s+-\\s+(.+?)\\s+-\\s+Indeed/i);if(m){ro=m[1].trim();co=m[2].trim();}}",
    "if(!co){m=t.match(/^(.+?)\\s+at\\s+(.+)/i);if(m){ro=m[1].trim();co=m[2].replace(/[|\\u2013\\u2014].*/,'').trim();}}",
    `window.open('${boardUrl}?company='+encodeURIComponent(co)+'&role='+encodeURIComponent(ro)+'&url='+encodeURIComponent(u),'_blank');`,
    "})();",
  ].join("");
  return "javascript:" + script;
}
