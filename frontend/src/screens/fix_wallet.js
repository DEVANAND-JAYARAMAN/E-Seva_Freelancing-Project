const fs = require('fs');
let code = fs.readFileSync('WalletPage.tsx', 'utf8');

// Replace useLocalStorage import
code = code.replace(/import \{ useLocalStorage \} from "\.\.\/hooks\/useLocalStorage";\n/, '');

// Replace specific config/data imports safely
code = code.replace(/initialTransactions,\s*initialPaymentRequests,\s*/, '');

// Replace useLocalStorage variables with useState
code = code.replace(/const \[transactions, setTransactions\] = useLocalStorage<WalletTransaction\[\]>\([\s\S]*?\);/, 
`const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const baseUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/(?:\\/api|\\/)+$/, '');
        const res = await fetch(\`\${baseUrl}/api/wallet/transactions?userId=\${user?.id}\`, {
          headers: { Authorization: \`Bearer \${localStorage.getItem('token')}\` }
        });
        if(res.ok) {
          const data = await res.json();
          setTransactions(data || []);
        }
      } catch(err) {
        console.error(err);
      }
    };
    if (user?.id) fetchTransactions();
  }, [user?.id]);`);

code = code.replace(/const \[paymentRequests, setPaymentRequests\] = useLocalStorage<[\s\S]*?>\([\s\S]*?\);/, 'const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);');

// remove reset function logic that resets to initialPaymentRequests
code = code.replace(/setPaymentRequests\(initialPaymentRequests\);/g, 'setPaymentRequests([]);');
code = code.replace(/setTransactions\(initialTransactions\);/g, 'setTransactions([]);');

fs.writeFileSync('WalletPage.tsx', code);
console.log('Fixed WalletPage.tsx mock data cleanly');
