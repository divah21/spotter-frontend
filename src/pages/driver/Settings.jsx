import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Settings } from 'lucide-react'
import { motion } from 'framer-motion'
import { useSelector } from 'react-redux'

export default function DriverSettings() {
  const user = useSelector((state) => state.auth.user)

  return (
    
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold text-[#021d26]">Settings</h1>
          <p className="text-gray-500 mt-1">Manage your profile and preferences</p>
        </div>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-[#021d26] flex items-center gap-2">
              <Settings className="h-6 w-6" />
              Profile Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" defaultValue={user?.name || 'John Driver'} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue={user?.email || 'driver@example.com'} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" defaultValue={user?.phone || '(555) 123-4567'} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="licenseNumber">CDL License Number</Label>
                <Input id="licenseNumber" defaultValue="DL-12345678" />
              </div>
              <Button className="bg-[#021d26] hover:bg-[#032a36]">
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    
  )
}
