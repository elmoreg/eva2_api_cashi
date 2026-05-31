import { Hono } from 'hono'
import { 
  getTransactions, 
  getTransactionById, 
  createTransaction, 
  updateTransaction, 
  deleteTransaction,
  getBalance,
  uploadReceipt
} from '../controllers/transactions.controller.js'

const transactionsRouter = new Hono()

transactionsRouter.get('/',        getTransactions)
transactionsRouter.post('/upload', uploadReceipt)
// Nota: El endpoint de balance debe ir antes de /:id para evitar conflictos
transactionsRouter.get('/balance', getBalance)
transactionsRouter.get('/:id',     getTransactionById)
transactionsRouter.post('/',       createTransaction)
transactionsRouter.patch('/:id',   updateTransaction)
transactionsRouter.delete('/:id',  deleteTransaction)

export default transactionsRouter
