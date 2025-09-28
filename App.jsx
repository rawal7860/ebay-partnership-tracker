import React, { useState, useEffect, useMemo } from 'react';
import { 
  Home, 
  Package, 
  ShoppingBag, 
  Calculator, 
  FileText, 
  Settings,
  Plus,
  Upload,
  Download,
  TrendingUp,
  Warehouse,
  Ship,
  DollarSign,
  Users,
  AlertTriangle,
  CheckCircle,
  Save,
  FileSpreadsheet
} from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // State for bulk inventory
  const [bulkInventory, setBulkInventory] = useState([]);
  const [showAddInventory, setShowAddInventory] = useState(false);
  const [inventoryForm, setInventoryForm] = useState({
    shipmentId: '',
    sku: '',
    productName: '',
    quantity: '',
    manufacturingCost: '',
    shippingCost: '',
    arrivalDate: ''
  });

  // State for eBay orders
  const [ebayOrders, setEbayOrders] = useState([]);
  const [showAddOrder, setShowAddOrder] = useState(false);
  const [orderForm, setOrderForm] = useState({
    orderId: '',
    sku: '',
    productName: '',
    quantity: '',
    salePrice: '',
    ebayFees: '',
    shippingCost: '',
    source: 'houston',
    orderDate: ''
  });

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedInventory = localStorage.getItem('ebayBulkInventory');
    const savedOrders = localStorage.getItem('ebayOrders');
    
    if (savedInventory) {
      setBulkInventory(JSON.parse(savedInventory));
    }
    if (savedOrders) {
      setEbayOrders(JSON.parse(savedOrders));
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('ebayBulkInventory', JSON.stringify(bulkInventory));
  }, [bulkInventory]);

  useEffect(() => {
    localStorage.setItem('ebayOrders', JSON.stringify(ebayOrders));
  }, [ebayOrders]);

  // Financial calculations
  const financialSummary = useMemo(() => {
    // Calculate Umer's total costs (manufacturing + shipping to Houston)
    const umerTotalCosts = bulkInventory.reduce((sum, item) => {
      const manufacturing = parseFloat(item.manufacturingCost) || 0;
      const shipping = parseFloat(item.shippingCost) || 0;
      const quantity = parseInt(item.quantity) || 0;
      return sum + (manufacturing * quantity) + (shipping * quantity);
    }, 0);

    // Calculate Shahzad's total costs (Houston to customer shipping)
    const shahzadTotalCosts = ebayOrders
      .filter(order => order.source === 'houston')
      .reduce((sum, order) => {
        const shippingCost = parseFloat(order.shippingCost) || 0;
        return sum + shippingCost;
      }, 0);

    // Calculate total revenue
    const totalRevenue = ebayOrders.reduce((sum, order) => {
      const salePrice = parseFloat(order.salePrice) || 0;
      const quantity = parseInt(order.quantity) || 0;
      return sum + (salePrice * quantity);
    }, 0);
    
    // Calculate total fees
    const totalFees = ebayOrders.reduce((sum, order) => {
      const fees = parseFloat(order.ebayFees) || 0;
      return sum + fees;
    }, 0);
    
    // Calculate total costs
    const totalCosts = umerTotalCosts + shahzadTotalCosts + totalFees;
    
    // Calculate profit
    const totalProfit = totalRevenue - totalCosts;
    
    // Calculate each partner's share (50/50)
    const partnerShare = totalProfit / 2;
    
    // Calculate what's owed to each partner
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

  // Inventory tracking
  const inventorySummary = useMemo(() => {
    const inventoryMap = new Map();
    
    // Add bulk inventory quantities
    bulkInventory.forEach(item => {
      const sku = item.sku;
      const quantity = parseInt(item.quantity) || 0;
      
      if (!inventoryMap.has(sku)) {
        inventoryMap.set(sku, {
          sku: sku,
          productName: item.productName,
          warehouseStock: 0,
          directShipments: 0
        });
      }
      inventoryMap.get(sku).warehouseStock += quantity;
    });
    
    // Subtract sold items from inventory
    ebayOrders.forEach(order => {
      const sku = order.sku;
      const quantity = parseInt(order.quantity) || 0;
      
      if (inventoryMap.has(sku)) {
        if (order.source === 'houston') {
          inventoryMap.get(sku).warehouseStock -= quantity;
        } else {
          inventoryMap.get(sku).directShipments += quantity;
        }
      } else {
        // Handle orders for items not in bulk inventory (direct shipments only)
        inventoryMap.set(sku, {
          sku: sku,
          productName: order.productName,
          warehouseStock: 0,
          directShipments: quantity
        });
      }
    });
    
    return Array.from(inventoryMap.values()).filter(item => 
      item.warehouseStock > 0 || item.directShipments > 0
    );
  }, [bulkInventory, ebayOrders]);

  // Form handlers
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
      shipmentId: '',
      sku: '',
      productName: '',
      quantity: '',
      manufacturingCost: '',
      shippingCost: '',
      arrivalDate: ''
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
      orderId: '',
      sku: '',
      productName: '',
      quantity: '',
      salePrice: '',
      ebayFees: '',
      shippingCost: '',
      source: 'houston',
      orderDate: ''
    });
    setShowAddOrder(false);
  };

  // Export/Import functionality
  const exportData = () => {
    const data = {
      bulkInventory,
      ebayOrders,
      exportedAt: new Date().toISOString()
    };
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'ebay-partnership-data.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.bulkInventory && data.ebayOrders) {
          setBulkInventory(data.bulkInventory);
          setEbayOrders(data.ebayOrders);
          alert('Data imported successfully!');
        } else {
          alert('Invalid file format');
        }
      } catch (error) {
        alert('Error importing data: ' + error.message);
      }
    };
    reader.readAsText(file);
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to delete all data? This cannot be undone.')) {
      setBulkInventory([]);
      setEbayOrders([]);
      localStorage.removeItem('ebayBulkInventory');
      localStorage.removeItem('ebayOrders');
    }
  };

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: Home },
    { id: 'inventory', name: 'Bulk Inventory', icon: Warehouse },
    { id: 'orders', name: 'eBay Orders', icon: ShoppingBag },
    { id: 'calculations', name: 'Profit Calculator', icon: Calculator },
    { id: 'settlements', name: 'Settlements', icon: FileText },
    { id: 'settings', name: 'Data Management', icon: Settings }
  ];

  const Dashboard = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <button 
          onClick={exportData}
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700 transition-colors"
        >
          <Download className="h-4 w-4" />
          <span>Export Data</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${financialSummary.totalRevenue.toFixed(2)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Profit</p>
              <p className="text-2xl font-bold text-gray-900">${financialSummary.totalProfit.toFixed(2)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Umer's Costs</p>
              <p className="text-2xl font-bold text-gray-900">${financialSummary.umerTotalCosts.toFixed(2)}</p>
            </div>
            <Users className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Shahzad's Costs</p>
              <p className="text-2xl font-bold text-gray-900">${financialSummary.shahzadTotalCosts.toFixed(2)}</p>
            </div>
            <Users className="h-8 w-8 text-pink-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
          <p className="text-sm text-gray-600 mt-3">
            Positive values indicate amount owed to partner. Negative values indicate amount partner owes.
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Inventory Status</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {inventorySummary.length > 0 ? (
              inventorySummary.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 border-b border-gray-100 last:border-b-0">
                  <div>
                    <p className="font-medium text-sm">{item.productName}</p>
                    <p className="text-xs text-gray-600">SKU: {item.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">{item.warehouseStock} in stock</p>
                    {item.directShipments > 0 && (
                      <p className="text-xs text-blue-600">{item.directShipments} direct shipped</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No inventory data available</p>
            )}
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
          <button 
            onClick={() => setShowAddInventory(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-purple-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Shipment</span>
          </button>
          <button 
            onClick={exportData}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {bulkInventory.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No inventory shipments yet</h3>
          <p className="text-gray-600 mb-4">Add your first bulk inventory shipment to get started</p>
          <button 
            onClick={() => setShowAddInventory(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Cost</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Arrival Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bulkInventory.map((item) => {
                  const totalCost = (parseFloat(item.manufacturingCost) + parseFloat(item.shippingCost)) * parseInt(item.quantity);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.shipmentId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.productName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.sku}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${parseFloat(item.manufacturingCost).toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${parseFloat(item.shippingCost).toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${totalCost.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.arrivalDate}</td>
                    </tr>
                  );
                })}
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
          <button 
            onClick={() => setShowAddOrder(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Order</span>
          </button>
          <button 
            onClick={exportData}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {ebayOrders.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
          <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No eBay orders yet</h3>
          <p className="text-gray-600 mb-4">Add your first eBay order to start tracking</p>
          <button 
            onClick={() => setShowAddOrder(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
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
                {ebayOrders.map((order) => {
                  const totalRevenue = parseFloat(order.salePrice) * parseInt(order.quantity);
                  return (
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
                          order.source === 'houston' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {order.source === 'houston' ? 'Houston' : 'Direct'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.orderDate}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const ProfitCalculator = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Profit Calculator</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Revenue & Costs</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Revenue:</span>
              <span className="font-medium">${financialSummary.totalRevenue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Umer's Total Costs:</span>
              <span className="font-medium">${financialSummary.umerTotalCosts.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shahzad's Total Costs:</span>
              <span className="font-medium">${financialSummary.shahzadTotalCosts.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">eBay Fees:</span>
              <span className="font-medium">${financialSummary.totalFees.toFixed(2)}</span>
            </div>
            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between font-bold text-lg">
                <span>Total Profit:</span>
                <span className={financialSummary.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                  ${financialSummary.totalProfit.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Partner Distribution</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Each Partner's Share:</span>
              <span className="font-medium">${financialSummary.partnerShare.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t">
              <span className="font-medium text-purple-600">Umer's Net:</span>
              <span className={`font-bold text-lg ${financialSummary.umerNet >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {financialSummary.umerNet >= 0 ? '+' : ''}${financialSummary.umerNet.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium text-pink-600">Shahzad's Net:</span>
              <span className={`font-bold text-lg ${financialSummary.shahzadNet >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {financialSummary.shahzadNet >= 0 ? '+' : ''}${financialSummary.shahzadNet.toFixed(2)}
              </span>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <AlertTriangle className="inline h-4 w-4 mr-1" />
              Positive values mean the partner is owed money. Negative values mean the partner owes money.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4">Cost Breakdown by Partner</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-purple-600 mb-3">Umer's Costs</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span>Manufacturing Costs:</span>
                <span>${bulkInventory.reduce((sum, item) => {
                  const manufacturing = parseFloat(item.manufacturingCost) || 0;
                  const quantity = parseInt(item.quantity) || 0;
                  return sum + (manufacturing * quantity);
                }, 0).toFixed(2)}</span>
              </li>
              <li className="flex justify-between">
                <span>Shipping to Houston:</span>
                <span>${bulkInventory.reduce((sum, item) => {
                  const shipping = parseFloat(item.shippingCost) || 0;
                  const quantity = parseInt(item.quantity) || 0;
                  return sum + (shipping * quantity);
                }, 0).toFixed(2)}</span>
              </li>
              <li className="flex justify-between font-medium pt-2 border-t">
                <span>Total:</span>
                <span>${financialSummary.umerTotalCosts.toFixed(2)}</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-pink-600 mb-3">Shahzad's Costs</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span>Houston to Customer Shipping:</span>
                <span>${financialSummary.shahzadTotalCosts.toFixed(2)}</span>
              </li>
              <li className="flex justify-between font-medium pt-2 border-t">
                <span>Total:</span>
                <span>${financialSummary.shahzadTotalCosts.toFixed(2)}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const Settlements = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Settlement Reports</h2>
      
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Current Settlement Status</h3>
          <button 
            onClick={exportData}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border-2 border-dashed border-purple-200 rounded-xl p-6 text-center">
            <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h4 className="font-semibold text-lg mb-2">Umer</h4>
            <p className="text-2xl font-bold mb-2">
              {financialSummary.umerNet >= 0 ? '+' : ''}${financialSummary.umerNet.toFixed(2)}
            </p>
            {financialSummary.umerNet >= 0 ? (
              <p className="text-green-600">Owed to Umer</p>
            ) : (
              <p className="text-red-600">Umer owes</p>
            )}
          </div>
          
          <div className="border-2 border-dashed border-pink-200 rounded-xl p-6 text-center">
            <Users className="h-12 w-12 text-pink-600 mx-auto mb-4" />
            <h4 className="font-semibold text-lg mb-2">Shahzad</h4>
            <p className="text-2xl font-bold mb-2">
              {financialSummary.shahzadNet >= 0 ? '+' : ''}${financialSummary.shahzadNet.toFixed(2)}
            </p>
            {financialSummary.shahzadNet >= 0 ? (
              <p className="text-green-600">Owed to Shahzad</p>
            ) : (
              <p className="text-red-600">Shahzad owes</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4">How Settlements Work</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <p><strong>Step 1:</strong> All costs are tracked automatically based on your entries</p>
          <p><strong>Step 2:</strong> Total profit is calculated and split 50/50 between partners</p>
          <p><strong>Step 3:</strong> Each partner's net position is calculated by subtracting their costs from their profit share</p>
          <p><strong>Step 4:</strong> The partner with a positive net balance receives payment from the other partner</p>
        </div>
      </div>
    </div>
  );

  const DataManagement = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Data Management</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Download className="h-5 w-5 mr-2" />
            Export Data
          </h3>
          <p className="text-gray-600 mb-4">
            Export all your inventory and order data as a JSON file for backup or sharing.
          </p>
          <button 
            onClick={exportData}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700 transition-colors"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Export All Data</span>
          </button>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Upload className="h-5 w-5 mr-2" />
            Import Data
          </h3>
          <p className="text-gray-600 mb-4">
            Import previously exported data to restore your records.
          </p>
          <label className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors cursor-pointer">
            <Upload className="h-4 w-4" />
            <span>Choose File</span>
            <input 
              type="file" 
              accept=".json" 
              onChange={importData}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4 flex items-center text-red-600">
          <AlertTriangle className="h-5 w-5 mr-2" />
          Clear All Data
        </h3>
        <p className="text-gray-600 mb-4">
          This will permanently delete all inventory shipments and eBay orders from this browser.
          Make sure to export your data first if you want to keep a backup.
        </p>
        <button 
          onClick={clearAllData}
          className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-red-700 transition-colors"
        >
          <AlertTriangle className="h-4 w-4" />
          <span>Clear All Data</span>
        </button>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-2 flex items-center text-yellow-800">
          <AlertTriangle className="h-5 w-5 mr-2" />
          Important Notes
        </h3>
        <ul className="text-yellow-700 space-y-2 text-sm">
          <li>• All data is stored in your browser's local storage</li>
          <li>• Data will persist between browser sessions but is specific to this browser/device</li>
          <li>• Always export your data regularly as a backup</li>
          <li>• Clearing browser data will delete all your records</li>
          <li>• For multi-device access, export/import data between devices</li>
        </ul>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'inventory':
        return <BulkInventory />;
      case 'orders':
        return <EbayOrders />;
      case 'calculations':
        return <ProfitCalculator />;
      case 'settlements':
        return <Settlements />;
      case 'settings':
        return <DataManagement />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">eBay Partnership Tracker</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Shahzad & Umer Partnership</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
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

          {/* Main Content */}
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Add Inventory Modal */}
      {showAddInventory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add Bulk Inventory Shipment</h3>
              <button 
                onClick={() => setShowAddInventory(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Plus className="h-6 w-6 rotate-45" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shipment ID *</label>
                <input 
                  type="text" 
                  name="shipmentId"
                  value={inventoryForm.shipmentId}
                  onChange={handleInventoryChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  placeholder="e.g., SHIP001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                <input 
                  type="text" 
                  name="productName"
                  value={inventoryForm.productName}
                  onChange={handleInventoryChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  placeholder="e.g., Glow Serum"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
                <input 
                  type="text" 
                  name="sku"
                  value={inventoryForm.sku}
                  onChange={handleInventoryChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  placeholder="e.g., BEAUTY-001"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                  <input 
                    type="number" 
                    name="quantity"
                    value={inventoryForm.quantity}
                    onChange={handleInventoryChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                    placeholder="e.g., 500"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturing Cost per Unit ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    name="manufacturingCost"
                    value={inventoryForm.manufacturingCost}
                    onChange={handleInventoryChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                    placeholder="e.g., 12.50"
                    min="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Cost per Unit to Houston ($)</label>
                <input 
                  type="number" 
                  step="0.01"
                  name="shippingCost"
                  value={inventoryForm.shippingCost}
                  onChange={handleInventoryChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  placeholder="e.g., 8.75"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Arrival Date *</label>
                <input 
                  type="date" 
                  name="arrivalDate"
                  value={inventoryForm.arrivalDate}
                  onChange={handleInventoryChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button 
                  onClick={() => setShowAddInventory(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button 
                  onClick={addInventory}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Shipment</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Order Modal */}
      {showAddOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add eBay Order</h3>
              <button 
                onClick={() => setShowAddOrder(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Plus className="h-6 w-6 rotate-45" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order ID *</label>
                <input 
                  type="text" 
                  name="orderId"
                  value={orderForm.orderId}
                  onChange={handleOrderChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="e.g., EBAY-12345"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                <input 
                  type="text" 
                  name="productName"
                  value={orderForm.productName}
                  onChange={handleOrderChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="e.g., Glow Serum"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
                <input 
                  type="text" 
                  name="sku"
                  value={orderForm.sku}
                  onChange={handleOrderChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="e.g., BEAUTY-001"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                  <input 
                    type="number" 
                    name="quantity"
                    value={orderForm.quantity}
                    onChange={handleOrderChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="e.g., 2"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sale Price per Unit ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    name="salePrice"
                    value={orderForm.salePrice}
                    onChange={handleOrderChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="e.g., 45.00"
                    min="0"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">eBay Fees ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    name="ebayFees"
                    value={orderForm.ebayFees}
                    onChange={handleOrderChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="e.g., 6.75"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Cost ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    name="shippingCost"
                    value={orderForm.shippingCost}
                    onChange={handleOrderChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="e.g., 4.50"
                    min="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order Source *</label>
                <select 
                  name="source"
                  value={orderForm.source}
                  onChange={handleOrderChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="houston">Shipped from Houston Warehouse</option>
                  <option value="direct">Shipped Directly from Pakistan</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order Date *</label>
                <input 
                  type="date" 
                  name="orderDate"
                  value={orderForm.orderDate}
                  onChange={handleOrderChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button 
                  onClick={() => setShowAddOrder(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button 
                  onClick={addOrder}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Order</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
