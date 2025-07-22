'use client';

interface HoldDebuggerProps {
  holds: any[];
}

export default function HoldDebugger({ holds }: HoldDebuggerProps) {
  return (
    <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-yellow-500">
      <h3 className="text-yellow-300 font-semibold mb-2">🔍 Hold Debug Info</h3>
      <div className="text-sm space-y-2">
        <div>Total holds in database: <strong>{holds.length}</strong></div>
        
        {holds.length === 0 ? (
          <div className="text-red-300">No holds found in the database</div>
        ) : (
          holds.map((hold, index) => {
            const f = hold.fields;
            const now = new Date();
            const expiresAt = f.hold_expires_at ? new Date(f.hold_expires_at) : null;
            const isExpired = expiresAt && expiresAt < now;
            
            return (
              <div key={hold.id} className="border border-gray-600 p-2 rounded">
                <div className="font-medium">Hold #{index + 1} (ID: {hold.id})</div>
                <div className="ml-2 text-xs space-y-1">
                  <div>Status: <span className="text-yellow-300">"{f.hold_status}"</span> {!f.hold_status && <span className="text-red-300">(MISSING)</span>}</div>
                  <div>Customer: {f.customer_name || '(no name)'}</div>
                  <div>Email: {f.customer_email || '(no email)'}</div>
                  <div>Products: {f.Products ? `[${f.Products.join(', ')}]` : '(no products)'}</div>
                  <div>Expires: {f.hold_expires_at || '(no expiration)'} 
                    {isExpired && <span className="text-red-300 ml-2">EXPIRED</span>}
                    {expiresAt && !isExpired && <span className="text-green-300 ml-2">ACTIVE</span>}
                  </div>
                  <div>Should show: <span className={
                    ['Active', 'active', 'ACTIVE'].includes(f.hold_status) && !isExpired 
                      ? 'text-green-300' : 'text-red-300'
                  }>
                    {['Active', 'active', 'ACTIVE'].includes(f.hold_status) && !isExpired ? 'YES' : 'NO'}
                  </span></div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}