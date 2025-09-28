import React, { useState, useEffect, useMemo } from 'react';
import { 
  Home, Package, ShoppingBag, Calculator, FileText, Settings,
  Plus, Download, TrendingUp, Warehouse, DollarSign, Users, AlertTriangle
} from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [bulkInventory, setBulkInventory] = useState([]);
  const [showAddInventory, setShowAddInventory] = useState(false);
  const [inventoryForm, setInventoryForm] = useState({
    shipmentId: '', sku: '', productName: '', quantity: '', manufacturingCost: '', shippingCost: '', arrivalDate: ''
  });

  const [ebayOrders, setEbayOrders] = useState([]);
  const [showAddOrder, setShowAddOrder] = useState(false);
  const [orderForm, setOrderForm] = useState({
    orderId: '', sku: '', productName: '', quantity: '', salePrice: '', ebayFees: '', shippingCost: '', source: 'houston', orderDate: ''
  });

  useEffect(() => {
    const savedInventory = localStorage.getItem('ebayBulkInventory');
    const savedOrders = localStorage.getItem('ebayOrders');
    if (savedInventory) setBulkInventory(JSON.parse(savedInventory));
    if (savedOrders) setEbayOrders(JSON.parse(savedOrders));
  }, []);

  useEffect(() => {
    localStorage.setItem('ebayBulkInventory', JSON.stringify(bulkInventory));
  }, [bulkInventory]);

  useEffect(() => {
    localStorage.setItem('ebayOrders', JSON.stringify(ebayOrders));
  }, [ebayOrders]);

  const financialSummary = useMemo(() => {
    const umerTotalCosts = bulkInventory.reduce((sum, item) => {
      const manufacturing = parseFloat(item.manufacturingCost) || 0;
      const shipping = parseFloat(item.shippingCost) || 0;
      const quantity = parseInt(item.quantity) || 0;
      return sum + (manufacturing * quantity) + (shipping * quantity);
    }, 0);

    const shahzadTotalCosts = ebayOrders
      .filter(order => order.source === 'houston')
      .reduce((sum, order) => sum + (parseFloat(order.shippingCost) || 0), 0);

    const totalRevenue = ebayOrders.reduce((sum, order) => {
      const salePrice = parseFloat(order.salePrice) || 0;
      const quantity = parseInt(order.quantity) || 0;
      return sum + (salePrice * quantity);
    }, 0);
    
    const totalFees = ebayOrders.reduce((sum, order) => sum + (parseFloat(order.ebayFees) || 0), 0);
    const totalCosts = umerTotalCosts + shahzadTotalCosts + totalFees;
    const totalProfit = totalRevenue - totalCosts;
    const partnerShare = totalProfit / 2;
    const umerNet = partnerShare - umerTotalCosts;
    const shahzadNet = partnerShare - shahzadTotalCosts;

    return {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalProfit: Math.round(totalProfit * 100) / 100,
      umerTotalCosts: Math.round(umerTotalCosts * 100) / 100,
      shahzadTotalCosts: Math.round(shahzadTotalCosts * 100) / 100,
      totalFees: Math.round(totalFees * 100) / 100,
      umerNet: Math.round(umerNet * 100) / 100,
      shahzadNet: Math.round(shahzadNet * 100) / 100,
      partnerShare: Math.round(partnerShare * 100) / 100
    };
  }, [bulkInventory, ebayOrders]);

  const handleInventoryChange = (e) => {
    const { name, value } = e.target;
    setInventoryForm(prev => ({ ...prev, [name]: value }));
  };

  const handleOrderChange = (e) => {
    const { name, value } = e.target;
    setOrderForm(prev => ({ ...prev, [name]: value }));
  };

  const addInventory = () => {
    if (!inventoryForm.shipmentId || !inventoryForm.sku || !inventoryForm.productName || 
        !inventoryForm.quantity || !inventoryForm.arrivalDate) {
      alert('Please fill in all required fields');
      return;
    }

    const newInventory = {
      id: Date.now(),
      ...inventoryForm,
      quantity: parseInt(inventoryForm.quantity),
      manufacturingCost: parseFloat(inventoryForm.manufacturingCost) || 0,
      shippingCost: parseFloat(inventoryForm.shippingCost) || 0
    };

    setBulkInventory(prev => [...prev, newInventory]);
    setInventoryForm({
      shipmentId: '', sku: '', productName: '', quantity: '', manufacturingCost: '', shippingCost: '', arrivalDate: ''
    });
    setShowAddInventory(false);
  };

  const addOrder = () => {
    if (!orderForm.orderId || !orderForm.sku || !orderForm.productName || 
        !orderForm.quantity || !orderForm.salePrice || !orderForm.orderDate) {
      alert('Please fill in all required fields');
      return;
    }

    const newOrder = {
      id: Date.now(),
      ...orderForm,
      quantity: parseInt(orderForm.quantity),
      salePrice: parseFloat(orderForm.salePrice),
      ebayFees: parseFloat(orderForm.ebayFees) || 0,
      shippingCost: parseFloat(orderForm.shippingCost) || 0
    };

    setEbayOrders(prev => [...prev, newOrder]);
    setOrderForm({
      orderId: '', sku: '', productName: '', quantity: '', salePrice: '', ebayFees: '', shippingCost: '', source: 'houston', orderDate: ''
    });
    setShowAddOrder(false);
  };

  const exportData = () => {
    const data = { bulkInventory, ebayOrders, exportedAt: new Date().toISOString() };
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', 'ebay-partnership-data.json');
    linkElement.click();
  };

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: Home },
    { id: 'inventory', name: 'Bulk Inventory', icon: Warehouse },
    { id: 'orders', name: 'eBay Orders', icon: ShoppingBag }
  ];

  const Dashboard = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <button onClick={exportData} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700">
          <Download className="h-4 w-4" />
          <span>Export Data</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium text-gray-600">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900">${financialSummary.totalRevenue.toFixed(2)}</p></div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium text-gray-600">Total Profit</p>
            <p className="text-2xl font-bold text-gray-900">${financialSummary.totalProfit.toFixed(2)}</p></div>
            <DollarSign className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium text-gray-600">Umer's Costs</p>
            <p className="text-2xl font-bold text-gray-900">${financialSummary.umerTotalCosts.toFixed(2)}</p></div>
            <Users className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium text-gray-600">Shahzad's Costs</p>
            <p className="text-2xl font-bold text-gray-900">${financialSummary.shahzadTotalCosts.toFixed(2)}</p></div>
            <Users className="h-8 w-8 text-pink-500" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4">Partner Settlements</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Users className="h-5 w-5 text-purple-600" />
              <span className="font-medium">Umer</span>
            </div>
            <span className={`font-bold ${financialSummary.umerNet >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {financialSummary.umerNet >= 0 ? '+' : ''}${financialSummary.umerNet.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-pink-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Users className="h-5 w-5 text-pink-600" />
              <span className="font-medium">Shahzad</span>
            </div>
            <span className={`font-bold ${financialSummary.shahzadNet >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {financialSummary.shahzadNet >= 0 ? '+' : ''}${financialSummary.shahzadNet.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const BulkInventory = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Bulk Inventory</h2>
        <div className="flex space-x-3">
          <button onClick={() => setShowAddInventory(true)} className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-purple-700">
            <Plus className="h-4 w-4" />
            <span>Add Shipment</span>
          </button>
          <button onClick={exportData} className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-700">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {bulkInventory.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No inventory shipments yet</h3>
          <button onClick={() => setShowAddInventory(true)} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
            Add Shipment
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shipment ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mfg Cost</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shipping Cost</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Arrival Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bulkInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.shipmentId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.productName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.sku}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${parseFloat(item.manufacturingCost).toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${parseFloat(item.shippingCost).toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.arrivalDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const EbayOrders = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">eBay Orders</h2>
        <div className="flex space-x-3">
          <button onClick={() => setShowAddOrder(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            <span>Add Order</span>
          </button>
          <button onClick={exportData} className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-700">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {ebayOrders.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
          <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No eBay orders yet</h3>
          <button onClick={() => setShowAddOrder(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Add Order
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sale Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">eBay Fees</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shipping Cost</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ebayOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.orderId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.productName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.sku}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${parseFloat(order.salePrice).toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${parseFloat(order.ebayFees).toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${parseFloat(order.shippingCost).toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.source === 'houston' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {order.source === 'houston' ? 'Houston' : 'Direct'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.orderDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'inventory': return <BulkInventory />;
      case 'orders': return <EbayOrders />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">eBay Partnership Tracker</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-64 flex-shrink-0">
            <nav className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <ul className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <li key={tab.id}>
                      <button
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          activeTab === tab.id
                            ? 'bg-purple-100 text-purple-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{tab.name}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Add Inventory Modal */}
      {showAddInventory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add Bulk Inventory Shipment</h3>
              <button onClick={() => setShowAddInventory(false)} className="text-gray-400 hover:text-gray-600">
                <Plus className="h-6 w-6 rotate-45" />
              </button>
            </div>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Shipment ID *</label>
                <input type="text" name="shipmentId" value={inventoryForm.shipmentId} onChange={handleInventoryChange} className="w-full rounded-md border-gray-300" placeholder="e.g., SHIP001" />
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                <input type="text" name="productName" value={inventoryForm.productName} onChange={handleInventoryChange} className="w-full rounded-md border-gray-300" placeholder="e.g., Glow Serum" />
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
                <input type="text" name="sku" value={inventoryForm.sku} onChange={handleInventoryChange} className="w-full rounded-md border-gray-300" placeholder="e.g., BEAUTY-001" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                  <input type="number" name="quantity" value={inventoryForm.quantity} onChange={handleInventoryChange} className="w-full rounded-md border-gray-300" placeholder="e.g., 500" min="1" />
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Manufacturing Cost per Unit ($)</label>
                  <input type="number" step="0.01" name="manufacturingCost" value={inventoryForm.manufacturingCost} onChange={handleInventoryChange} className="w-full rounded-md border-gray-300" placeholder="e.g., 12.50" min="0" />
                </div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Shipping Cost per Unit to Houston ($)</label>
                <input type="number" step="0.01" name="shippingCost" value={inventoryForm.shippingCost} onChange={handleInventoryChange} className="w-full rounded-md border-gray-300" placeholder="e.g., 8.75" min="0" />
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Arrival Date *</label>
                <input type="date" name="arrivalDate" value={inventoryForm.arrivalDate} onChange={handleInventoryChange} className="w-full rounded-md border-gray-300" />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button onClick={() => setShowAddInventory(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button>
                <button onClick={addInventory} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">Add Shipment</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Order Modal */}
      {showAddOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add eBay Order</h3>
              <button onClick={() => setShowAddOrder(false)} className="text-gray-400 hover:text-gray-600">
                <Plus className="h-6 w-6 rotate-45" />
              </button>
            </div>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Order ID *</label>
                <input type="text" name="orderId" value={orderForm.orderId} onChange={handleOrderChange} className="w-full rounded-md border-gray-300" placeholder="e.g., EBAY-12345" />
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                <input type="text" name="productName" value={orderForm.productName} onChange={handleOrderChange} className="w-full rounded-md border-gray-300" placeholder="e.g., Glow Serum" />
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
                <input type="text" name="sku" value={orderForm.sku} onChange={handleOrderChange} className="w-full rounded-md border-gray-300" placeholder="e.g., BEAUTY-001" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                  <input type="number" name="quantity" value={orderForm.quantity} onChange={handleOrderChange} className="w-full rounded-md border-gray-300" placeholder="e.g., 2" min="1" />
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Sale Price per Unit ($)</label>
                  <input type="number" step="0.01" name="salePrice" value={orderForm.salePrice} onChange={handleOrderChange} className="w-full rounded-md border-gray-300" placeholder="e.g., 45.00" min="0" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">eBay Fees ($)</label>
                  <input type="number" step="0.01" name="ebayFees" value={orderForm.ebayFees} onChange={handleOrderChange} className="w-full rounded-md border-gray-300" placeholder="e.g., 6.75" min="0" />
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Shipping Cost ($)</label>
                  <input type="number" step="0.01" name="shippingCost" value={orderForm.shippingCost} onChange={handleOrderChange} className="w-full rounded-md border-gray-300" placeholder="e.g., 4.50" min="0" />
                </div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Order Source *</label>
                <select name="source" value={orderForm.source} onChange={handleOrderChange} className="w-full rounded-md border-gray-300">
                  <option value="houston">Shipped from Houston Warehouse</option>
                  <option value="direct">Shipped Directly from Pakistan</option>
                </select>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Order Date *</label>
                <input type="date" name="orderDate" value={orderForm.orderDate} onChange={handleOrderChange} className="w-full rounded-md border-gray-300" />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button onClick={() => setShowAddOrder(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button>
                <button onClick={addOrder} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Add Order</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
