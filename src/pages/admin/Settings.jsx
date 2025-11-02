import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Settings } from 'lucide-react'
import { motion } from 'framer-motion'

export default function AdminSettings() {
  return (
    
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold text-[#053E4F]">Settings</h1>
          <p className="text-gray-500 mt-1">Manage your account and preferences</p>
        </div>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-[#053E4F] flex items-center gap-2">
              <Settings className="h-6 w-6" />
              Account Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input id="companyName" defaultValue="Spotter Logistics" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="admin@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" defaultValue="(555) 123-4567" />
              </div>
              <Button className="bg-[#032a36] hover:bg-[#021d26]">
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    
  )
}
