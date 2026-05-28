import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCcw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Une erreur est survenue
            </CardTitle>
            <CardDescription>
              {this.state.error?.message || 'Une erreur inattendue s\'est produite.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={this.handleReset} className="gap-2">
              <RefreshCcw className="h-4 w-4" />
              Réessayer
            </Button>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}
