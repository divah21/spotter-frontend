import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ConfirmDialog, AlertDialog } from '@/components/ui/Dialog'
import { Users, Plus, Search, Mail, Phone, Clock, Loader2, AlertCircle, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { motion } from 'framer-motion'
import { Sheet, SheetContent } from '@/components/ui/Sheet'
import {
  fetchUsers,
  createNewUser,
  updateExistingUser,
  deleteExistingUser,
  toggleUserStatus
} from '@/redux/userSlice'

export default function AdminDrivers() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const { users, loading, error } = useSelector((state) => state.user)
  const [open, setOpen] = useState(false)
  const [detail, setDetail] = useState(null)
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [actionLoading, setActionLoading] = useState(null)
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, type: null, userId: null })
  const [alertDialog, setAlertDialog] = useState({ isOpen: false, title: '', message: '' })

  useEffect(() => {
    dispatch(fetchUsers())
  }, [dispatch])

  useEffect(() => {
    if (query) setSearchParams({ q: query })
    else setSearchParams({})
  }, [query, setSearchParams])

  const drivers = useMemo(() => {
    return users.filter((u) => u.role === 'driver')
  }, [users])

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return drivers.filter(
      (d) =>
        `${d.first_name} ${d.last_name}`.toLowerCase().includes(q) ||
        d.email.toLowerCase().includes(q) ||
        (d.phone && d.phone.toLowerCase().includes(q)) ||
        d.username.toLowerCase().includes(q)
    )
  }, [drivers, query])

  const [form, setForm] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    password: '',
    password_confirm: ''
  })

  const [formError, setFormError] = useState('')

  const addDriver = async () => {
    if (!form.username || !form.email || !form.first_name || !form.last_name || !form.password) {
      setFormError('Please fill in all required fields')
      return
    }

    if (form.password !== form.password_confirm) {
      setFormError('Passwords do not match')
      return
    }

    setActionLoading('create')
    setFormError('')
    try {
      await dispatch(
        createNewUser({
          username: form.username,
          email: form.email,
          first_name: form.first_name,
          last_name: form.last_name,
          phone: form.phone,
          password: form.password,
          role: 'driver'
        })
      ).unwrap()
      setForm({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        phone: '',
        password: '',
        password_confirm: ''
      })
      setOpen(false)
      dispatch(fetchUsers())
    } catch (error) {
      setFormError(error.message || 'Failed to create driver')
    } finally {
      setActionLoading(null)
    }
  }

  const handleToggleStatus = async (userId) => {
    setActionLoading(`toggle-${userId}`)
    try {
      await dispatch(toggleUserStatus(userId)).unwrap()
      dispatch(fetchUsers())
    } catch (error) {
      if (import.meta.env.DEV) console.error('Toggle status error:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteDriver = async (userId) => {
    setConfirmDialog({
      isOpen: true,
      type: 'delete',
      userId: userId
    })
  }

  const confirmDelete = async () => {
    const userId = confirmDialog.userId
    setConfirmDialog({ isOpen: false, type: null, userId: null })
    
    setActionLoading(`delete-${userId}`)
    try {
      await dispatch(deleteExistingUser(userId)).unwrap()
      dispatch(fetchUsers())
      setDetail(null)
    } catch (error) {
      if (import.meta.env.DEV) console.error('Delete driver error:', error)
      setAlertDialog({
        isOpen: true,
        title: 'Error',
        message: error.response?.data?.error || 'Failed to delete driver'
      })
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#053E4F]">Drivers</h1>
            <p className="text-gray-500 mt-1">Manage your fleet drivers</p>
          </div>
          <Button className="bg-[#032a36] hover:bg-[#021d26]" onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-5 w-5" />
            Add Driver
          </Button>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm text-red-600 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </p>
          </div>
        )}

        <Card className="shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-[#053E4F] flex items-center gap-2">
                <Users className="h-6 w-6" />
                All Drivers ({filtered.length})
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search drivers..."
                  className="pl-10 w-64"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#053E4F]" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">
                  {query ? 'No drivers match your search' : 'No drivers yet. Add your first driver!'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map((driver) => (
                  <div
                    key={driver.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="space-y-1 flex-1">
                      <p className="font-medium text-[#053E4F]">
                        {driver.first_name} {driver.last_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        @{driver.username} • {driver.email}
                      </p>
                      {driver.phone && (
                        <p className="text-sm text-gray-500">
                          <Phone className="inline-block w-3 h-3 mr-1" />
                          {driver.phone}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-2 sm:mt-0">
                      <Badge variant={driver.is_active ? 'default' : 'secondary'}>
                        {driver.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button variant="outline" size="sm" onClick={() => setDetail(driver)}>
                        Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStatus(driver.id)}
                        disabled={actionLoading === `toggle-${driver.id}`}
                      >
                        {actionLoading === `toggle-${driver.id}` ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : driver.is_active ? (
                          'Deactivate'
                        ) : (
                          'Activate'
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="right" className="w-full sm:w-[460px]">
            <h3 className="text-xl font-semibold text-[#053E4F] mb-4">Add Driver</h3>
            {formError && (
              <div className="p-3 mb-4 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{formError}</p>
              </div>
            )}
            <div className="space-y-3">
              <div>
                <Label>Username *</Label>
                <Input
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="johndoe"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>First Name *</Label>
                  <Input
                    value={form.first_name}
                    onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                    placeholder="John"
                  />
                </div>
                <div>
                  <Label>Last Name *</Label>
                  <Input
                    value={form.last_name}
                    onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="john@company.com"
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="(555) 000-0000"
                />
              </div>
              <div>
                <Label>Password *</Label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
              <div>
                <Label>Confirm Password *</Label>
                <Input
                  type="password"
                  value={form.password_confirm}
                  onChange={(e) => setForm({ ...form, password_confirm: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={addDriver} className="flex-1" disabled={actionLoading === 'create'}>
                  {actionLoading === 'create' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Driver'
                  )}
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <Sheet open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
          <SheetContent side="right" className="w-full sm:w-[460px]">
            {detail && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-[#053E4F]">
                    {detail.first_name} {detail.last_name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">@{detail.username}</p>
                  <div className="flex items-center gap-2 text-gray-600 mt-2">
                    <Mail className="w-4 h-4" /> {detail.email}
                  </div>
                  {detail.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" /> {detail.phone}
                    </div>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    Joined: {new Date(detail.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant={detail.is_active ? 'default' : 'secondary'}>
                    {detail.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleStatus(detail.id)}
                    disabled={actionLoading === `toggle-${detail.id}`}
                  >
                    {actionLoading === `toggle-${detail.id}` ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : detail.is_active ? (
                      'Deactivate'
                    ) : (
                      'Activate'
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => handleDeleteDriver(detail.id)}
                    disabled={actionLoading === `delete-${detail.id}`}
                  >
                    {actionLoading === `delete-${detail.id}` ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </>
                    )}
                  </Button>
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  <Button
                    className="w-full"
                    onClick={() =>
                      navigate(`/admin/trips?driver=${detail.id}`)
                    }
                  >
                    View Trips
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      navigate(`/admin/logs?driver=${detail.id}`)
                    }
                  >
                    View Logs
                  </Button>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>

        <ConfirmDialog
          isOpen={confirmDialog.isOpen && confirmDialog.type === 'delete'}
          onClose={() => setConfirmDialog({ isOpen: false, type: null, userId: null })}
          onConfirm={confirmDelete}
          title="Delete Driver"
          message="Are you sure you want to delete this driver? This action cannot be undone and will remove all associated data."
          confirmText="Delete"
          cancelText="Cancel"
          variant="destructive"
        />

        <AlertDialog
          isOpen={alertDialog.isOpen}
          onClose={() => setAlertDialog({ isOpen: false, title: '', message: '' })}
          title={alertDialog.title}
          message={alertDialog.message}
        />
    </motion.div>
  )
}
